import { ColumnFilter, PaginationState, SortingState } from "@tanstack/react-table";
import { useDictionary } from "hooks/useDictionary";
import { useEffect, useRef, useState } from "react";
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
* @param {boolean} refreshFlag Flag to trigger refresh when required.
* @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
* @param {DateRange} selectedDate The currently selected date.
* @param {PaginationState} apiPagination The pagination state for API query.
* @param { ColumnFilter[]} filters The current filters set.
* @param {TableColumnOption[]} columnOptions Configuration for table columns options.
*/
export function useTableData(
  entityType: string,
  sortParams: string,
  sorting: SortingState,
  refreshFlag: boolean,
  lifecycleStage: LifecycleStage,
  selectedDate: DateRange,
  apiPagination: PaginationState,
  filters: ColumnFilter[],
  columnOptions: TableColumnOption[]
): TableDataDescriptor {
  const dict: Dictionary = useDictionary();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialInstances, setInitialInstances] = useState<
    RegistryFieldValues[]
  >([]);
  const [selectedCount, setSelectedCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [data, setData] = useState<FieldValues[]>([]);
  const [columns, setColumns] = useState<EnhancedColumnDef<FieldValues>[]>([]);

  const isInitialLoad = useRef(true);

  // A hook that refetches all data when the dialogs are closed
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      const filterParams: string = parseColumnFiltersIntoUrlParams(filters, dict.title.blank, dict.title);
      try {
        let instances: RegistryFieldValues[] = [];
        let url: string;
        if (lifecycleStage == LifecycleStageMap.OUTSTANDING) {
          url = makeInternalRegistryAPIwithParams(
            lifecycleStage,
            entityType,
            apiPagination.pageIndex.toString(),
            apiPagination.pageSize.toString(),
            sortParams,
            filterParams,
          );
        } else if (lifecycleStage == LifecycleStageMap.BILLABLE) {
          url = makeInternalRegistryAPIwithParams(
            InternalApiIdentifierMap.INVOICEABLE,
            entityType,
            apiPagination.pageIndex.toString(),
            apiPagination.pageSize.toString(),
            sortParams,
            filterParams,
          );
        } else if (
          lifecycleStage == LifecycleStageMap.SCHEDULED ||
          lifecycleStage == LifecycleStageMap.CLOSED
        ) {
          url = makeInternalRegistryAPIwithParams(
            lifecycleStage,
            entityType,
            getUTCDate(selectedDate.from).getTime().toString(),
            getUTCDate(selectedDate.to).getTime().toString(),
            apiPagination.pageIndex.toString(),
            apiPagination.pageSize.toString(),
            sortParams,
            filterParams,
          );
        } else if (
          lifecycleStage == LifecycleStageMap.GENERAL ||
          lifecycleStage == LifecycleStageMap.ACCOUNT ||
          lifecycleStage == LifecycleStageMap.PRICING ||
          lifecycleStage == LifecycleStageMap.INVOICE) {
          url = makeInternalRegistryAPIwithParams(
            InternalApiIdentifierMap.INSTANCES,
            entityType,
            "true",
            null,
            null,
            apiPagination.pageIndex.toString(),
            apiPagination.pageSize.toString(),
            sortParams,
            filterParams,
          );
        } else {
          url = makeInternalRegistryAPIwithParams(
            InternalApiIdentifierMap.CONTRACTS,
            lifecycleStage.toString(),
            entityType,
            apiPagination.pageIndex.toString(),
            apiPagination.pageSize.toString(),
            sortParams,
            filterParams,
          );
        }
        const res: AgentResponseBody = await queryInternalApi(url);
        instances = (res.data?.items as RegistryFieldValues[]) ?? [];
        setSelectedCount(res.data?.currentItemCount);
        setTotalCount(res.data?.totalItems);
        setInitialInstances(instances);
        const parsedData: FieldValues[] = parseDataForTable(instances, sorting, dict.title);
        const columns: EnhancedColumnDef<FieldValues>[] = parseColumnsMetadata(
          res.data?.columns,
          columnOptions,
          dict.title,
        );
        setData(parsedData);
        setColumns(columns);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching instances", error);
      }
    };

    if (isInitialLoad.current || refreshFlag) {
      // fetch data when the component first mounts or when refreshFlag is true
      fetchData();
      // After the first run, set the ref to false forever
      isInitialLoad.current = false;
    }

  }, [selectedDate, refreshFlag, apiPagination, sortParams, filters, columnOptions, entityType]);

  return {
    isLoading,
    data,
    columns,
    selectedCount,
    totalCount,
    initialInstances,
  };
}
