import { useDictionary } from "@/hooks/useDictionary";
import { localStorageManager } from "@/state/browser-storage-manager";
import { AgentResponseDataPayload, ColumnDefinitionResponse } from "@/types/backend-agent";
import { Dictionary } from "@/types/dictionary";
import { RegistryStatusMap } from "@/types/form";
import { TableColumnOption } from "@/types/settings";
import {
    EnhancedColumnDef,
    getInitialSortParams,
    parseColumnFiltersIntoUrlParams,
    parseColumnsMetadata
} from "@/ui/graphic/table/registry/registry-table-utils";
import { TASK_VIEWER_FILTER } from "@/utils/constants";
import { dexieTaskRepo, TASK_SYNC_EVENT } from "@/utils/db/dexie-task-repository";
import { ColumnFilter } from "@tanstack/react-table";
import { ReactVirtualizer, useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { useEffect, useRef, useState } from "react";
import { FieldValues } from "react-hook-form";
import { useLiveTasks } from "../dexie/useLiveTasks";
import { useConnected } from "../useConnected";
import useOperationStatus from "../useOperationStatus";

export interface GridDescriptor {
    isInitialLoading: boolean;
    hasNoActiveFilters: boolean;
    parentRef: React.RefObject<HTMLDivElement>;
    data: FieldValues[];
    previewData: FieldValues[];
    columns: EnhancedColumnDef<FieldValues>[];
    currentItemIndex: number;
    filters: ColumnFilter[];
    virtualItems: VirtualItem[];
    rowVirtualizer: ReactVirtualizer<HTMLDivElement, Element>;
    resetFormSession: () => void;
    triggerRefresh: () => void;
    updateFilter: (_field: string, _selectedOptions: string[]) => void;
    resetFilters: () => void;
}

const GRID_LIMIT: number = 100;
const INITIAL_FILTER_STATE: ColumnFilter[] = [{ id: "status", value: [RegistryStatusMap.ASSIGNED] }];

/**
 * A custom hook to retrieve grid data into functionalities for the registry.
 *
 * @param {string} entityType Type of entity for rendering.
 * @param {TableColumnOption[]} mobileFieldOptions Options for the mobile fields.
 */
export function useRegistryGrid(
    entityType: string,
    mobileFieldOptions: TableColumnOption[],
): GridDescriptor {
    const dict: Dictionary = useDictionary();
    const { resetFormSession } = useOperationStatus();

    const parentRef: React.RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const [currentItemIndex, setCurrentItemIndex] = useState<number>(1);
    const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
    const [isFetching, setIsFetching] = useState<boolean>(true);
    const [hasNoActiveFilters, setHasNoActiveFilters] = useState<boolean>(!localStorageManager.get(TASK_VIEWER_FILTER));

    const mobileFields = useRef<string[]>(mobileFieldOptions ? mobileFieldOptions?.map(option => option.name) : []);
    const [columns, setColumns] = useState<EnhancedColumnDef<FieldValues>[]>([]);
    const [filters, setFilters] = useState<ColumnFilter[]>(localStorageManager.get(TASK_VIEWER_FILTER) ? JSON.parse(localStorageManager.get(TASK_VIEWER_FILTER)) : INITIAL_FILTER_STATE);
    const isConnected: boolean = useConnected();

    const updateFilter = (field: string, selectedOptions: string[]) => {
        setFilters(prev => {
            const currentFieldIndex: number = prev.findIndex((f) => f.id === field);
            const filter: ColumnFilter = {
                id: field,
                value: selectedOptions,
            };
            let updatedFilters: ColumnFilter[];
            // Append if there is no previous filter for the field
            if (currentFieldIndex === -1) {
                updatedFilters = [...prev, filter];
            } else {
                updatedFilters = [...prev];
                updatedFilters[currentFieldIndex] = filter;
            }
            // Check for active filters
            const noActiveFilters: boolean = updatedFilters.filter(filter => filter?.id != "status")
                .every((filter) => (filter?.value as string[])?.length == 0);
            setHasNoActiveFilters(noActiveFilters);
            if (noActiveFilters) {
                localStorageManager.clear();
            } else {
                localStorageManager.set(TASK_VIEWER_FILTER, JSON.stringify(updatedFilters))
            }
            return updatedFilters;
        });
        triggerRefresh();
    };

    const resetFilters = () => {
        setFilters(INITIAL_FILTER_STATE);
        localStorageManager.clear();
        setHasNoActiveFilters(true);
        triggerRefresh();
    };

    const triggerRefresh = () => {
        setIsInitialLoading(true);
        setIsFetching(true);
    }

    const { data, previewData } = useLiveTasks(mobileFields.current, dict);
    const rowVirtualizer: ReactVirtualizer<HTMLDivElement, Element> = useVirtualizer({
        count: previewData.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 80,
        overscan: 15, // Low value to prevent auto-trigger the bottom row
        useFlushSync: false,
        onChange: (instance) => {
            const items: VirtualItem[] = instance.getVirtualItems();
            if (items.length === 0) return;

            const currentScroll: number = instance.scrollOffset;
            // Item covering more than 50% of screen
            const dominantItem: VirtualItem = items.find(
                (item) => (item.start + item.size / 2) > currentScroll
            );

            if (dominantItem) {
                setCurrentItemIndex(dominantItem.index);
            }
        }
    });

    const virtualItems: VirtualItem[] = rowVirtualizer.getVirtualItems();

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            const filterParams: string = parseColumnFiltersIntoUrlParams(filters, dict.title.blank, dict.title);
            const sortParams: string = getInitialSortParams([]);

            const tasks: AgentResponseDataPayload = await dexieTaskRepo.fetchTasks(
                entityType, "0", GRID_LIMIT.toString(), sortParams, filterParams);

            // Update cache by removing previous tasks first
            await dexieTaskRepo.clearTasks();
            const data: FieldValues[] = tasks?.items as FieldValues[];
            await dexieTaskRepo.bulkPutTasks(data);
            // Parsing of columns should only occur once at the start
            if (columns.length === 0) {
                const columnResponse: ColumnDefinitionResponse[] = mobileFields.current.length === 0 ?
                    // Without any mobile settings, status filters should be hidden
                    tasks?.columns.filter(col => col.value != "status") :
                    tasks?.columns.filter(col => mobileFields.current.includes(col.value)
                        || col.value == "id" || col.value == "event_id"
                        || col.value == "date");
                const columnData: EnhancedColumnDef<FieldValues>[] = parseColumnsMetadata(columnResponse, [], dict);
                setColumns(columnData);
            }
            // If total length is equal or more than limit, start a background sync
            const registration: ServiceWorkerRegistration = await navigator.serviceWorker?.ready;
            const targetWorker: ServiceWorker = navigator.serviceWorker?.controller || registration.active;
            // Do not trigger background sync if there are no active filters
            if (data.length >= GRID_LIMIT && targetWorker && !hasNoActiveFilters) {
                navigator.serviceWorker.controller.postMessage({
                    type: TASK_SYNC_EVENT,
                    payload: {
                        entityType,
                        sortParams,
                        filterParams,
                    },
                });
            }

            setIsFetching(false);
            setIsInitialLoading(false);
        }
        // Only fetch data if there are no ongoing fetches, and there are more data to fetch
        if (isFetching && isConnected) {
            fetchData();
        }
    }, [entityType, isConnected, isFetching, filters, columns?.length, dict]);

    return {
        isInitialLoading,
        hasNoActiveFilters,
        parentRef,
        data,
        previewData,
        columns,
        currentItemIndex,
        filters,
        virtualItems,
        rowVirtualizer,
        resetFormSession,
        triggerRefresh,
        updateFilter,
        resetFilters,
    };
}
