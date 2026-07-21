import { ColumnFilter, PaginationState, SortingState } from "@tanstack/react-table";
import { useDictionary } from "@/hooks/useDictionary";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { FieldValues } from "react-hook-form";
import { AgentResponseBody, InternalApiIdentifierMap } from "@/types/backend-agent";
import { Dictionary } from "@/types/dictionary";
import { LifecycleStage, LifecycleStageMap, RegistryFieldValues } from "@/types/form";
import { TableColumnOption } from "@/types/settings";
import { EnhancedColumnDef, parseColumnFiltersIntoUrlParams, parseColumnsMetadata, parseDataForTable } from "@/ui/graphic/table/registry/registry-table-utils";
import { getUTCDate } from "@/utils/client-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "@/utils/internal-api-services";

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
* @param {number} firstVisiblePageSize Number of records to fetch immediately for the first visible page.
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
  firstVisiblePageSize: number,
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
    const controller: AbortController = new AbortController();

    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      const filterParams: string = parseColumnFiltersIntoUrlParams(filters, dict.title.blank, dict.title);

      const buildApiUrl = (page: string, limit: string): string => {
        if (lifecycleStage == LifecycleStageMap.OUTSTANDING) {
          return makeInternalRegistryAPIwithParams(lifecycleStage, entityType, getUTCDate(new Date()).getTime().toString(), page, limit, sortParams, filterParams);
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
        // For page sizes equal and above 50, a full batch call is executed
        // For page sizes below 50, calls are executed in two requests to improve first visible page's performance
        // The speed difference above 50 is no longer significant enough to demand these changes
        const currentPage: string = firstVisiblePageSize >= 50 ? apiPagination.pageIndex.toString() : (apiPagination.pageIndex * (apiPagination.pageSize / firstVisiblePageSize)).toString();
        const apiUrl: string = buildApiUrl(currentPage, firstVisiblePageSize >= 50 ?
          apiPagination.pageSize.toString() : firstVisiblePageSize.toString());
        if (firstVisiblePageSize < 50) {
          setIsBackgroundLoading(true);
        }
        const res: AgentResponseBody = await queryInternalApi(apiUrl, undefined, undefined, controller.signal);
        const instances: RegistryFieldValues[] = (res.data?.items as RegistryFieldValues[]) ?? [];
        const parsedData: FieldValues[] = parseDataForTable(instances, sorting, dict.title, res.data?.columns);
        const columns: EnhancedColumnDef<FieldValues>[] = parseColumnsMetadata(res.data?.columns ?? [], columnOptions, dict);
        setSelectedCount(res.data?.currentItemCount);
        setTotalCount(res.data?.totalItems);
        setInitialInstances(instances);
        setData(parsedData);
        // Retain the last known columns when a response has no metadata (e.g. an empty
        // filtered result) so the table header stays visible over the empty state.
        setColumns(prevColumns => columns.length > 0 ? columns : prevColumns);
        setIsLoading(false);
        if (firstVisiblePageSize < 50) {
          // Capped Remainder: fetch the full batch in the background so subsequent pages are instant
          const cappedRemainderRes: AgentResponseBody = await queryInternalApi(buildApiUrl(apiPagination.pageIndex.toString(), apiPagination.pageSize.toString()), undefined, undefined, controller.signal);
          const cappedRemainderInstances: RegistryFieldValues[] = (cappedRemainderRes.data?.items as RegistryFieldValues[]) ?? [];
          const cappedRemainderParsedData: FieldValues[] = parseDataForTable(cappedRemainderInstances, sorting, dict.title, cappedRemainderRes.data?.columns);
          setInitialInstances(cappedRemainderInstances);
          setData(cappedRemainderParsedData);
          setIsBackgroundLoading(false);
        }
      } catch (error) {
        if ((error as DOMException).name === "AbortError") {
          if (firstVisiblePageSize < 50) {
            setIsBackgroundLoading(false);
          }
          return;
        }
        console.error("Error fetching instances", error);
      }
    };

    fetchData();
    return () => { controller.abort(); };
  }, [selectedDate, refreshId, apiPagination, sortParams, filters, columnOptions, entityType, firstVisiblePageSize]);

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
