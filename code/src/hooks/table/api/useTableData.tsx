import { ColumnFilter, PaginationState, SortingState } from "@tanstack/react-table";
import { useDictionary } from "hooks/useDictionary";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { FieldValues } from "react-hook-form";
import { AgentResponseBody, InternalApiIdentifierMap } from "types/backend-agent";
import { Dictionary } from "types/dictionary";
import { LifecycleStage, LifecycleStageMap, RegistryFieldValues } from "types/form";
import { parseColumnFiltersIntoUrlParams, parseDataForTable, TableData } from "ui/graphic/table/registry/registry-table-utils";
import { getUTCDate } from "utils/client-utils";
import { makeInternalRegistryAPIwithParams, queryInternalApi } from "utils/internal-api-services";

export interface TableDataDescriptor {
  isLoading: boolean;
  tableData: TableData;
  initialInstances: RegistryFieldValues[];
}

/**
* A custom hook to retrieve the total row count.
* 
* @param {string} pathNameEnd End of the current path name.
* @param {string} entityType Type of entity for rendering.
* @param {string} sortParams List of parameters for sorting.
* @param {SortingState} sorting Current sorting state.
* @param {boolean} refreshFlag Flag to trigger refresh when required.
* @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
* @param {DateRange} selectedDate The currently selected date.
* @param {PaginationState} apiPagination The pagination state for API query.
* @param { ColumnFilter[]} filters The current filters set.
*/
export function useTableData(
  pathNameEnd: string,
  entityType: string,
  sortParams: string,
  sorting: SortingState,
  refreshFlag: boolean,
  lifecycleStage: LifecycleStage,
  selectedDate: DateRange,
  apiPagination: PaginationState,
  filters: ColumnFilter[]): TableDataDescriptor {
  const dict: Dictionary = useDictionary();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialInstances, setInitialInstances] = useState<
    RegistryFieldValues[]
  >([]);
  const [data, setData] = useState<
    TableData
  >(null);

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
            InternalApiIdentifierMap.OUTSTANDING,
            entityType,
            apiPagination.pageIndex.toString(),
            apiPagination.pageSize.toString(),
            sortParams,
            filterParams,
          );
        } else if (
          lifecycleStage == LifecycleStageMap.SCHEDULED ||
          lifecycleStage == LifecycleStageMap.CLOSED ||
          lifecycleStage == LifecycleStageMap.ACTIVITY
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
          lifecycleStage == LifecycleStageMap.PRICING) {
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

        setInitialInstances(instances);
        const parsedData: TableData = parseDataForTable(instances, dict.title);
        setData({
          ...parsedData,
          data: parsedData.data.sort((a: FieldValues, b: FieldValues): number => {
            for (const sort of sorting) {
              const field: string = sort.id;
              const valA: string = a[field];
              const valB: string = b[field];
              // For null, undefined, or empty values, 
              // A comes last if descending, and first if ascending
              if (!valA) return sort.desc ? 1 : -1;
              // B comes first if descending, and last if ascending
              if (!valB) return sort.desc ? -1 : 1;

              const comparison: number = valA.localeCompare(valB, undefined, { sensitivity: 'base' });
              // Only returns the comparison if they are not equal on this sort field
              // A user may have multiple fields to sort, and if they are equal on this field, 
              // we must continue with the other fields to compare
              if (comparison !== 0) {
                return sort.desc ? -comparison : comparison;
              }
            }
            // If all fields are equal, there is no need to reorder
            return 0;
          })
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching instances", error);
      }
    };

    fetchData();
  }, [selectedDate, refreshFlag, apiPagination, sortParams, filters]);

  return {
    isLoading,
    tableData: data,
    initialInstances,
  };
}
