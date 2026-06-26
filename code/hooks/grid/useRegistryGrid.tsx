import { useDictionary } from "@/hooks/useDictionary";
import { AgentResponseBody, ColumnDefinitionResponse } from "@/types/backend-agent";
import { Dictionary } from "@/types/dictionary";
import { LifecycleStageMap, RegistryFieldValues } from "@/types/form";
import { TableColumnOption } from "@/types/settings";
import {
    EnhancedColumnDef,
    getInitialSortParams,
    parseColumnFiltersIntoUrlParams,
    parseColumnsMetadata,
    parseDataForTable
} from "@/ui/graphic/table/registry/registry-table-utils";
import { getId } from "@/utils/client-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "@/utils/internal-api-services";
import { ColumnFilter } from "@tanstack/react-table";
import { ReactVirtualizer, useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { useEffect, useRef, useState } from "react";
import { FieldValues } from "react-hook-form";
import useOperationStatus from "../useOperationStatus";

export interface GridDescriptor {
    parentRef: React.RefObject<HTMLDivElement>;
    data: FieldValues[];
    columns: EnhancedColumnDef<FieldValues>[];
    filters: ColumnFilter[];
    virtualItems: VirtualItem[];
    rowVirtualizer: ReactVirtualizer<HTMLDivElement, Element>;
    resetFormSession: () => void;
    triggerRefresh: () => void;
    updateFilter: (_field: string, _selectedOptions: string[]) => void;
    resetFilters: () => void;
}

const GRID_LIMIT: number = 50;

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
    const { refreshId, resetFormSession, triggerRefresh } = useOperationStatus();

    const parentRef: React.RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState<number>(0);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const mobileFields = useRef<string[]>(mobileFieldOptions ? mobileFieldOptions?.map(option => option.name) : []);
    const [data, setData] = useState<FieldValues[]>([]);
    const [columns, setColumns] = useState<EnhancedColumnDef<FieldValues>[]>([]);
    const [filters, setFilters] = useState<ColumnFilter[]>([]);

    const updateFilter = (field: string, selectedOptions: string[]) => {
        setFilters(prev => {
            const currentFieldIndex: number = prev.findIndex((f) => f.id === field);
            const filter: ColumnFilter = {
                id: field,
                value: selectedOptions,
            };
            // Append if there is no previous filter for the field
            if (currentFieldIndex === -1) {
                return [...prev, filter];
            }
            const updatedFilters: ColumnFilter[] = [...prev];
            updatedFilters[currentFieldIndex] = filter;
            return updatedFilters;
        });
        setPage(0);
        setHasMore(true);
        setData([])
    };

    const resetFilters = () => {
        setFilters([]);
        setPage(0);
        setHasMore(true);
        setData([])
    };

    const rowVirtualizer: ReactVirtualizer<HTMLDivElement, Element> = useVirtualizer({
        // If there is always more, virtual items must be 1 more to trigger the refetch
        count: hasMore ? data.length + 1 : data.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 80,
        overscan: 15, // Low value to prevent auto-trigger the bottom row
        useFlushSync: false,
    });

    const virtualItems: VirtualItem[] = rowVirtualizer.getVirtualItems();
    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            const lastVirtualItem: VirtualItem = virtualItems[virtualItems.length - 1];
            // Fetches the next range when it hits the threshold because there is one more virtual item than data
            if (lastVirtualItem.index >= data.length) {
                setIsFetching(true);
                const filterParams: string = parseColumnFiltersIntoUrlParams(filters, dict.title.blank, dict.title);
                const apiUrl: string = makeInternalRegistryAPIwithParams(LifecycleStageMap.OUTSTANDING, entityType, page.toString(), GRID_LIMIT.toString(), getInitialSortParams([]), filterParams);
                const res: AgentResponseBody = await queryInternalApi(apiUrl);
                const instances: RegistryFieldValues[] = (res.data?.items as RegistryFieldValues[]) ?? [];

                let parsedData: FieldValues[] = parseDataForTable(instances, [], dict.title, res.data?.columns);
                parsedData = parsedData.map(instance => {
                    if (!mobileFields.current) return instance;
                    return {
                        id: instance.id,
                        event_id: getId(instance.event_id),
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
                    const columnResponse: ColumnDefinitionResponse[] = !mobileFields.current ? res.data?.columns :
                        res.data?.columns.filter(col => mobileFields.current.includes(col.value)
                            || col.value == "id" || col.value == "event_id"
                            || col.value == "status" || col.value == "date");
                    const columnData: EnhancedColumnDef<FieldValues>[] = parseColumnsMetadata(columnResponse, [], dict);
                    setColumns(columnData);
                }
                // If total length is smaller than size, there are no more instances to render
                if (parsedData.length < GRID_LIMIT) {
                    setHasMore(false);
                }
                setData((prev) => [...prev, ...parsedData]);
                setPage((prev) => prev + 1);
                setIsFetching(false);
            };
        }

        // Only fetch data if there are no ongoing fetches, and there are more data to fetch
        if (!isFetching && hasMore && virtualItems.length > 0) {
            fetchData();
        }
    }, [entityType, refreshId, virtualItems, filters]);

    return {
        parentRef,
        data,
        columns,
        filters,
        virtualItems,
        rowVirtualizer,
        resetFormSession,
        triggerRefresh,
        updateFilter,
        resetFilters,
    };
}
