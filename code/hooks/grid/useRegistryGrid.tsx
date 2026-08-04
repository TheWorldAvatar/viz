import { useDictionary } from "@/hooks/useDictionary";
import { localStorageManager } from "@/state/browser-storage-manager";
import { AgentResponseBody, ColumnDefinitionResponse } from "@/types/backend-agent";
import { Dictionary } from "@/types/dictionary";
import { LifecycleStageMap, RegistryFieldValues, RegistryStatusMap } from "@/types/form";
import { TableColumnOption } from "@/types/settings";
import {
    EnhancedColumnDef,
    getInitialSortParams,
    parseColumnFiltersIntoUrlParams,
    parseColumnsMetadata,
    parseDataForTable
} from "@/ui/graphic/table/registry/registry-table-utils";
import { getId, getUTCDate } from "@/utils/client-utils";
import { TASK_VIEWER_FILTER } from "@/utils/constants";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "@/utils/internal-api-services";
import { bulkPutTasks, clearTasks, useLiveTasks } from "@/utils/db/dexie-task-utils";
import { ColumnFilter } from "@tanstack/react-table";
import { ReactVirtualizer, useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { useEffect, useRef, useState } from "react";
import { FieldValues } from "react-hook-form";
import useOperationStatus from "../useOperationStatus";

export interface GridDescriptor {
    isInitialLoading: boolean;
    hasNoActiveFilters: boolean;
    parentRef: React.RefObject<HTMLDivElement>;
    data: FieldValues[];
    previewData: FieldValues[];
    columns: EnhancedColumnDef<FieldValues>[];
    currentItemIndex: number;
    selectedCount: number;
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
    const [page, setPage] = useState<number>(0);
    const [currentItemIndex, setCurrentItemIndex] = useState<number>(1);
    const [selectedCount, setSelectedCount] = useState<number>(0);
    const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    // Synchronous lock against duplicate fetch triggers: scroll events fire faster
    // than state re-renders, so the onChange guard cannot rely on isFetching alone
    const fetchLockRef: React.RefObject<boolean> = useRef<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [hasNoActiveFilters, setHasNoActiveFilters] = useState<boolean>(true);

    const mobileFields = useRef<string[]>(mobileFieldOptions ? mobileFieldOptions?.map(option => option.name) : []);
    const [columns, setColumns] = useState<EnhancedColumnDef<FieldValues>[]>([]);
    const [filters, setFilters] = useState<ColumnFilter[]>(INITIAL_FILTER_STATE);

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
        setPage(0);
        setSelectedCount(0);
        triggerRefresh();
    };

    const resetFilters = () => {
        setFilters(INITIAL_FILTER_STATE);
        localStorageManager.clear();
        setHasNoActiveFilters(true);
        setPage(0);
        setSelectedCount(0);
        triggerRefresh();
    };

    const triggerRefresh = () => {
        clearTasks();
        setHasMore(true);
        setIsInitialLoading(true);
        fetchLockRef.current = true;
        setIsFetching(true);
    }

    const fetchNextPage = () => {
        fetchLockRef.current = true;
        setPage((prev) => prev + 1);
        setIsFetching(true);
    }

    const { data, previewData } = useLiveTasks(mobileFields.current, selectedCount, dict);
    const rowVirtualizer: ReactVirtualizer<HTMLDivElement, Element> = useVirtualizer({
        // If there is always more, virtual items must be 1 more to trigger the refetch
        count: hasMore ? previewData.length + 1 : previewData.length,
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
                // Trigger fetch once the user scrolls past the halfway mark of the loaded data.
                // Scroll events may skip indices (especially on Android momentum scrolling),
                // so this must be a range check rather than an equality check
                if (previewData.length > 0 && dominantItem.index >= previewData.length - GRID_LIMIT / 2 && !fetchLockRef.current && hasMore) {
                    fetchNextPage();
                }
            }
        }
    });

    const virtualItems: VirtualItem[] = rowVirtualizer.getVirtualItems();

    useEffect(() => {
        fetchLockRef.current = true;
        setIsFetching(true);
        // To prevent hydration effects when reading from storage
        if (localStorageManager.get(TASK_VIEWER_FILTER)) {
            setFilters(JSON.parse(localStorageManager.get(TASK_VIEWER_FILTER)));
            setHasNoActiveFilters(false);
        }
    }, []);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            let activeFilters: ColumnFilter[] = filters;
            if (localStorageManager.get(TASK_VIEWER_FILTER)) {
                activeFilters = JSON.parse(localStorageManager.get(TASK_VIEWER_FILTER));
            }
            const filterParams: string = parseColumnFiltersIntoUrlParams(activeFilters, dict.title.blank, dict.title);
            const apiUrl: string = makeInternalRegistryAPIwithParams(
                LifecycleStageMap.OUTSTANDING,
                entityType,
                getUTCDate(new Date()).getTime().toString(),
                page.toString(),
                GRID_LIMIT.toString(),
                getInitialSortParams([]),
                filterParams,
            );
            const res: AgentResponseBody = await queryInternalApi(apiUrl);
            const instances: RegistryFieldValues[] = (res.data?.items as RegistryFieldValues[]) ?? [];

            let parsedData: FieldValues[] = parseDataForTable(instances, [], dict.title, res.data?.columns).map(instance => {
                instance.event_id = getId(instance.event_id);
                return instance;
            });
            setSelectedCount(res.data?.currentItemCount);

            // Update cache
            await bulkPutTasks(parsedData);
            parsedData = parsedData.map(instance => {
                // When there are no custom settings, ensure only values with contents are returned
                if (mobileFields.current.length === 0) return {
                    // Extract event id to support redirects
                    event_id: instance.event_id,
                    ...Object.fromEntries(
                        Object.entries(instance).filter(([key, value]) => key != "iri" && key != "event_id" && value !== null && value !== undefined)
                    )
                };
                return {
                    id: instance.id,
                    event_id: instance.event_id,
                    date: instance.date,
                    status: instance.status,
                    ...Object.fromEntries(
                        // Filter out undefined fields
                        mobileFields.current.filter(field => !!instance[field as keyof typeof instance])
                            .map(field => [field, instance[field as keyof typeof instance]])
                    )
                }
            });
            // Parsing of columns should only occur once at the start
            if (columns.length === 0) {
                const columnResponse: ColumnDefinitionResponse[] = mobileFields.current.length === 0 ?
                    // Without any mobile settings, status filters should be hidden
                    res.data?.columns.filter(col => col.value != "status") :
                    res.data?.columns.filter(col => mobileFields.current.includes(col.value)
                        || col.value == "id" || col.value == "event_id"
                        || col.value == "date");
                const columnData: EnhancedColumnDef<FieldValues>[] = parseColumnsMetadata(columnResponse, [], dict);
                setColumns(columnData);
            }
            // If total length is smaller than size, there are no more instances to render
            if (parsedData.length < GRID_LIMIT) {
                setHasMore(false);
            }
            fetchLockRef.current = false;
            setIsFetching(false);
            setIsInitialLoading(false);
        }
        // Only fetch data if there are no ongoing fetches, and there are more data to fetch
        if (isFetching && hasMore) {
            fetchData();
        }
    }, [entityType, isFetching, filters]);

    return {
        isInitialLoading,
        hasNoActiveFilters,
        parentRef,
        data,
        previewData,
        columns,
        currentItemIndex,
        selectedCount,
        filters,
        virtualItems,
        rowVirtualizer,
        resetFormSession,
        triggerRefresh,
        updateFilter,
        resetFilters,
    };
}
