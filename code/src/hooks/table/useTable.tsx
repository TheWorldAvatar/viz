import {
  ColumnFilter,
  ColumnFiltersState,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
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
import { LifecycleStage, RegistryFieldValues } from "types/form";
import {
  genSortParams
} from "ui/graphic/table/registry/registry-table-utils";
import { useTableData } from "./api/useTableData";
import { RowCounts, useTotalRowCount } from "./api/useTotalRowCount";
import { useTablePagination } from "./useTablePagination";

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
  sortParams: string;
}

/**
* A custom hook to retrieve table data into functionalities for the registry table to function.
*
* @param {string} pathNameEnd End of the current path name.
* @param {string} entityType Type of entity for rendering.
* @param {boolean} refreshFlag Flag to trigger refresh when required.
* @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
* @param {DateRange} selectedDate The currently selected date.
*/
export function useTable(pathNameEnd: string, entityType: string, refreshFlag: boolean, lifecycleStage: LifecycleStage, selectedDate: DateRange): TableDescriptor {
  const dict: Dictionary = useDictionary();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [sortParams, setSortParams] = useState<string>(genSortParams(sorting, dict.title));
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [data, setData] = useState<FieldValues[]>([]);
  const { startIndex, pagination, apiPagination, onPaginationChange } = useTablePagination();
  const rowCounts: RowCounts = useTotalRowCount(entityType, refreshFlag, lifecycleStage, selectedDate, columnFilters);
  const { isLoading, tableData, initialInstances } = useTableData(pathNameEnd, entityType, sortParams, sorting, refreshFlag, lifecycleStage, selectedDate, apiPagination, columnFilters);

  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    const newSorting: SortingState = typeof updater === "function" ? updater(sorting) : updater;
    setSorting(newSorting);
    const params: string = genSortParams(newSorting, dict.title);
    setSortParams(params);
  };

  useEffect(() => {
    setData(tableData?.data.slice(startIndex, startIndex + pagination.pageSize));
  }, [tableData, pagination.pageIndex]);

  const table: Table<FieldValues> = useReactTable({
    data,
    columns: tableData?.columns,
    initialState: {
      pagination,
    },
    state: {
      columnFilters,
      sorting: sorting,
    },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    rowCount: rowCounts.filter,
    maxMultiSortColCount: 3,
    onPaginationChange,
    onColumnFiltersChange: setColumnFilters,
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
    sortParams,
  };
}
