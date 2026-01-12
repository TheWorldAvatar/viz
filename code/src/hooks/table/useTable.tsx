import {
  ColumnFilter,
  ColumnFiltersState,
  getCoreRowModel,
  getFacetedUniqueValues,
  OnChangeFn,
  PaginationState,
  SortingState,
  Table,
  useReactTable
} from "@tanstack/react-table";
import { useDictionary } from "hooks/useDictionary";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { FieldValues } from "react-hook-form";
import { Dictionary } from "types/dictionary";
import { LifecycleStage, RegistryFieldValues, LifecycleStageMap } from "types/form";
import {
  genSortParams
} from "ui/graphic/table/registry/registry-table-utils";
import { toast } from "ui/interaction/action/toast/toast";
import { useTableData } from "./api/useTableData";
import { RowCounts, useTotalRowCount } from "./api/useTotalRowCount";
import { useTablePagination } from "./useTablePagination";
import { TableColumnOrderSettings } from "types/settings";
import { browserStorageManager } from "state/browser-storage-manager";

export interface TableDescriptor {
  isLoading: boolean;
  table: Table<FieldValues>;
  data: FieldValues[];
  initialInstances: RegistryFieldValues[];
  setData: React.Dispatch<React.SetStateAction<FieldValues[]>>,
  pagination: PaginationState,
  apiPagination: PaginationState,
  totalRows: number;
  filters: ColumnFilter[];
  setFilters: React.Dispatch<React.SetStateAction<ColumnFilter[]>>,
  sortParams: string;
}

/**
* A custom hook to retrieve table data into functionalities for the registry table to function.
*
* @param {string} entityType Type of entity for rendering.
* @param {boolean} refreshFlag Flag to trigger refresh when required.
* @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
* @param {DateRange} selectedDate The currently selected date.
* @param {TableColumnOrderSettings} tableColumnOrderConfig Configuration for table column order.
* @param {string} accountType Optional value to indicate the type of account for billing capabilities.
*/
export function useTable(
  entityType: string,
  refreshFlag: boolean,
  lifecycleStage: LifecycleStage,
  selectedDate: DateRange,
  tableColumnOrder: TableColumnOrderSettings,
  accountType?: string,
): TableDescriptor {
  const dict: Dictionary = useDictionary();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [sortParams, setSortParams] = useState<string>(genSortParams(sorting, dict.title));
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
    if (lifecycleStage === LifecycleStageMap.ACTIVITY) {
      const storedAccountLabel = browserStorageManager.get(LifecycleStageMap.ACCOUNT);
      const storedAccountValue = browserStorageManager.get(accountType);
      if (storedAccountLabel && storedAccountValue) {
        return [{ id: accountType, value: [storedAccountLabel] }];
      }
    }
    return [];
  });
  const [data, setData] = useState<FieldValues[]>([]);
  const { startIndex, pagination, apiPagination, onPaginationChange } = useTablePagination();
  const rowCounts: RowCounts = useTotalRowCount(entityType, refreshFlag, lifecycleStage, selectedDate, columnFilters);
  const { isLoading, tableData, initialInstances } = useTableData(
    entityType,
    sortParams,
    sorting,
    refreshFlag,
    lifecycleStage,
    selectedDate,
    apiPagination,
    columnFilters,
    tableColumnOrder,
  );

  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    const newSorting: SortingState = typeof updater === "function" ? updater(sorting) : updater;
    setSorting(newSorting);
    const params: string = genSortParams(newSorting, dict.title);
    setSortParams(params);
  };

  useEffect(() => {
    setData(tableData?.data.slice(startIndex, startIndex + pagination.pageSize));
  }, [tableData, pagination.pageIndex]);


  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {

    const newFilters: ColumnFiltersState = (updater instanceof Function)
      ? updater(columnFilters)
      : updater;

    const activeNewFilters: ColumnFilter[] = newFilters.filter(filter => !!filter.value);

    // Limit to maximum 3 active filters at a time 
    if (activeNewFilters.length > 3) {
      toast(
        dict.message.maxFilters,
        "default",
      );

      return;
    }

    setColumnFilters(newFilters);
  };

  const table: Table<FieldValues> = useReactTable({
    data,
    columns: tableData?.columns,
    state: {
      columnFilters,
      pagination,
      sorting,
    },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    rowCount: rowCounts.filter,
    maxMultiSortColCount: 3,
    onPaginationChange,
    onColumnFiltersChange,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId: (row, index) => row.id + index,
  });

  return {
    isLoading,
    table,
    data,
    setData,
    initialInstances,
    pagination,
    apiPagination,
    totalRows: rowCounts.total,
    filters: columnFilters,
    setFilters: setColumnFilters,
    sortParams,
  };
}
