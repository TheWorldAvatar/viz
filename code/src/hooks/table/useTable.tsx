import {
  ColumnFilter,
  ColumnFiltersState,
  getCoreRowModel,
  getFacetedUniqueValues,
  OnChangeFn,
  PaginationState,
  SortingState,
  Table,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import { useDictionary } from "hooks/useDictionary";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { FieldValues } from "react-hook-form";
import { Dictionary } from "types/dictionary";
import { LifecycleStage, RegistryFieldValues } from "types/form";
import { TableColumnOption } from "types/settings";
import {
  genSortParams,
  getInitialColumnVisibilityState
} from "ui/graphic/table/registry/registry-table-utils";
import { toast } from "ui/interaction/action/toast/toast";
import { useTableData } from "./api/useTableData";
import { useTablePagination } from "./useTablePagination";

export interface TableDescriptor {
  isLoading: boolean;
  isBulkDispatchEdit: boolean;
  setIsBulkDispatchEdit: React.Dispatch<React.SetStateAction<boolean>>,
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
  selectedRowIds: Set<string>;
  setSelectedRows: (_rowId: string, _isRemove: boolean) => void;
}

/**
* A custom hook to retrieve table data into functionalities for the registry table to function.
*
* @param {string} entityType Type of entity for rendering.
* @param {number} refreshId Flag to refetch data when refresh is triggered.
* @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
* @param {TableColumnOption[]} tableColumnOptions Configuration for table column options.
* @param {ColumnFilter} invoiceAccountFilter Additional invoice filter.
* @param {DateRange} selectedDate Optional to put the currently selected date.
*/
export function useTable(
  entityType: string,
  refreshId: number,
  lifecycleStage: LifecycleStage,
  tableColumnOptions: TableColumnOption[],
  invoiceAccountFilter: ColumnFilter,
  selectedDate?: DateRange,
): TableDescriptor {
  const dict: Dictionary = useDictionary();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [isBulkDispatchEdit, setIsBulkDispatchEdit] = useState<boolean>(false);
  const [sortParams, setSortParams] = useState<string>(genSortParams(sorting, dict.title));
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentDataView, setCurrentDataView] = useState<FieldValues[]>([]);
  const { startIndex, pagination, apiPagination, onPaginationChange } = useTablePagination();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(getInitialColumnVisibilityState(tableColumnOptions, dict.title));

  const { isLoading, data, columns, selectedCount, totalCount, initialInstances } = useTableData(
    entityType,
    sortParams,
    sorting,
    refreshId,
    lifecycleStage,
    selectedDate,
    apiPagination,
    columnFilters,
    tableColumnOptions,
  );

  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    const newSorting: SortingState = typeof updater === "function" ? updater(sorting) : updater;
    setSorting(newSorting);
    const params: string = genSortParams(newSorting, dict.title);
    setSortParams(params);
  };


  useEffect(() => {
    setCurrentDataView(data?.slice(startIndex, startIndex + pagination.pageSize));
  }, [data, pagination.pageIndex]);

  useEffect(() => {
    if (invoiceAccountFilter) {
      // Take out any invoice account filter and add the latest version
      const nonDefaultFilters: ColumnFilter[] = columnFilters.filter(filter => filter.id != invoiceAccountFilter.id);
      setColumnFilters([...nonDefaultFilters, invoiceAccountFilter]);
    }
  }, [invoiceAccountFilter]);

  /** Adds or delete the selected row.
    * 
    * @param {string} rowId  The target row ID to add or delete.
    * @param {boolean} isRemove  Indicates if we should add or delete the row. Delete if true; add if not.
    */
  const setSelectedRows = (rowId: string, isRemove: boolean): void => {
    setSelectedRowIds((prev) => {
      const nextSet: Set<string> = new Set<string>(prev);
      if (isRemove) {
        nextSet.delete(rowId);
      } else {
        nextSet.add(rowId);
      }
      return nextSet;
    });
  };

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {

    const newFilters: ColumnFiltersState = (updater instanceof Function)
      ? updater(columnFilters)
      : updater;

    // In JS, an empty array is truthy, so we need to filter out the filters with empty array
    // or empty string value to get the actual active filters.
    const activeNewFilters: ColumnFilter[] = newFilters.filter((filter) => {
      if (filter.value === null || filter.value === undefined) {
        return false;
      }

      if (Array.isArray(filter.value)) {
        return filter.value.length > 0;
      }

      if (typeof filter.value === "string") {
        return filter.value.trim().length > 0;
      }

      return true;
    });

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
    data: currentDataView,
    columns,
    state: {
      columnFilters,
      columnVisibility,
      pagination,
      sorting,
    },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    rowCount: selectedCount,
    maxMultiSortColCount: 3,
    onPaginationChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId: (row, index) => row.id + index,
  });

  return {
    isLoading,
    isBulkDispatchEdit,
    setIsBulkDispatchEdit,
    table,
    data: currentDataView,
    setData: setCurrentDataView,
    initialInstances,
    pagination,
    apiPagination,
    totalRows: totalCount,
    filters: columnFilters,
    setFilters: setColumnFilters,
    sortParams,
    selectedRowIds,
    setSelectedRows,
  };
}
