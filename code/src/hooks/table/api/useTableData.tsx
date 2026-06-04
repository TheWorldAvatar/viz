import { ColumnFilter, PaginationState, SortingState } from "@tanstack/react-table";
import { useDictionary } from "hooks/useDictionary";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { FieldValues } from "react-hook-form";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { LifecycleStage, LifecycleStageMap, RegistryFieldValues } from "types/form";
import { TableColumnOption } from "types/settings";
import { EnhancedColumnDef, parseColumnFiltersIntoUrlParams, parseColumnsMetadata, parseDataForTable } from "ui/graphic/table/registry/registry-table-utils";
import { getUTCDate } from "utils/client-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";

export interface TableDataDescriptor {
  isLoading: boolean;
  isBackgroundLoading: boolean;
  selectedCount: number;
  totalCount: number;
  data: FieldValues[];
  columns: EnhancedColumnDef<FieldValues>[];
  initialInstances: RegistryFieldValues[];
}

/**
* A custom hook to retrieve the total row count.
*
* @param {string} entityType Type of entity for rendering.
* @param {string} sortParams List of parameters for sorting.
* @param {SortingState} sorting Current sorting state.
* @param {number} refreshId Flag to refetch data when refresh is triggered.
* @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
* @param {DateRange} selectedDate The currently selected date.
* @param {PaginationState} apiPagination The pagination state for API query.
* @param { ColumnFilter[]} filters The current filters set.
* @param {TableColumnOption[]} columnOptions Configuration for table columns options.
* @param {number} firstPageSize Number of records to fetch immediately for the first visible page.
*/
export function useTableData(
  entityType: string,
  sortParams: string,
  sorting: SortingState,
  refreshId: number,
  lifecycleStage: LifecycleStage,
  selectedDate: DateRange,
  apiPagination: PaginationState,
  filters: ColumnFilter[],
  columnOptions: TableColumnOption[],
  firstPageSize: number,
): TableDataDescriptor {
  const dict: Dictionary = useDictionary();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState<boolean>(false);
  const [initialInstances, setInitialInstances] = useState<
    RegistryFieldValues[]
  >([]);
  const [selectedCount, setSelectedCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [data, setData] = useState<FieldValues[]>([]);
  const [columns, setColumns] = useState<EnhancedColumnDef<FieldValues>[]>([]);

  useEffect(() => {
    // Prevents a stale fetch (e.g. from a previous filter/sort) from overwriting state
    // after deps change mid-flight (Between first call and second API call). Cleanup sets this to true, causing in-progress awaits to bail out.
    let cancelled: boolean = false;

    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      setIsBackgroundLoading(false);
      const filterParams: string = parseColumnFiltersIntoUrlParams(filters, dict.title.blank, dict.title);

      const buildApiUrl = (page: string, limit: string): string => {
        if (lifecycleStage == LifecycleStageMap.OUTSTANDING) {
          return makeInternalRegistryAPIwithParams(lifecycleStage, entityType, page, limit, sortParams, filterParams);
        } else if (lifecycleStage == LifecycleStageMap.BILLABLE) {
          return makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.INVOICEABLE, entityType, page, limit, sortParams, filterParams);
        } else if (lifecycleStage == LifecycleStageMap.SCHEDULED || lifecycleStage == LifecycleStageMap.CLOSED) {
          return makeInternalRegistryAPIwithParams(lifecycleStage, entityType, getUTCDate(selectedDate.from).getTime().toString(), getUTCDate(selectedDate.to).getTime().toString(), page, limit, sortParams, filterParams);
        } else if (lifecycleStage == LifecycleStageMap.GENERAL || lifecycleStage == LifecycleStageMap.PRICING || lifecycleStage == LifecycleStageMap.INVOICE) {
          return makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.INSTANCES, entityType, "true", null, null, page, limit, sortParams, filterParams);
        } else if (lifecycleStage == LifecycleStageMap.ACCOUNT) {
          return makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.ACCOUNT, entityType, page, limit, sortParams, filterParams);
        } else {
          return makeInternalRegistryAPIwithParams(InternalApiIdentifierMap.CONTRACTS, lifecycleStage.toString(), entityType, page, limit, sortParams, filterParams);
        }
      };

      try {
        // Current: fetch only the first visible page to unblock the UI immediately
        const currentPage: string = (apiPagination.pageIndex * (apiPagination.pageSize / firstPageSize)).toString();
        const currentRes: AgentResponseBody = await queryInternalApi(buildApiUrl(currentPage, firstPageSize.toString()));
        if (cancelled) return;

        const currentInstances: RegistryFieldValues[] = (currentRes.data?.items as RegistryFieldValues[]) ?? [];
        setSelectedCount(currentRes.data?.currentItemCount);
        setTotalCount(currentRes.data?.totalItems);
        setInitialInstances(currentInstances);
        setData(parseDataForTable(currentInstances, sorting, dict.title, currentRes.data?.columns));
        const columns: EnhancedColumnDef<FieldValues>[] = parseColumnsMetadata(
          currentRes.data?.columns,
          columnOptions,
          dict,
        );
        setColumns(columns);
        setIsLoading(false);
        setIsBackgroundLoading(true);

        // Capped Remainder: fetch the full batch in the background so subsequent pages are instant
        const cappedRemainderRes: AgentResponseBody = await queryInternalApi(buildApiUrl(apiPagination.pageIndex.toString(), apiPagination.pageSize.toString()));
        if (cancelled) return;

        const cappedRemainderInstances: RegistryFieldValues[] = (cappedRemainderRes.data?.items as RegistryFieldValues[]) ?? [];
        setInitialInstances(cappedRemainderInstances);
        setData(parseDataForTable(cappedRemainderInstances, sorting, dict.title, cappedRemainderRes.data?.columns));
        setIsBackgroundLoading(false);
      } catch (error) {
        console.error("Error fetching instances", error);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [selectedDate, refreshId, apiPagination, sortParams, filters, columnOptions, entityType, firstPageSize]);

  return {
    isLoading,
    isBackgroundLoading,
    data,
    columns,
    selectedCount,
    totalCount,
    initialInstances,
  };
}
