import {
  ColumnFiltersState,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  SortingState,
  Table,
  useReactTable
} from "@tanstack/react-table";
import { useDictionary } from "hooks/useDictionary";
import { useEffect, useMemo, useState } from "react";
import { FieldValues } from "react-hook-form";
import { Dictionary } from "types/dictionary";
import { RegistryFieldValues } from "types/form";
import {
  genSortParams,
  parseDataForTable,
  TableData,
} from "ui/graphic/table/registry/registry-table-utils";
import { useFirstActiveFilter } from "./useFirstActiveFilter";
import { useTablePagination } from "./useTablePagination";

export interface TableDescriptor {
  table: Table<FieldValues>;
  data: FieldValues[];
  setData: React.Dispatch<React.SetStateAction<FieldValues[]>>,
  pagination: PaginationState,
  apiPagination: PaginationState,
  firstActiveFilter: string;
  sortParams: string;
}

/**
* A custom hook to parse the instances into functionalities for the registry table to function.
*
* @param {RegistryFieldValues[]} instances - The target instances.
* @param {number} totalRows - The total row count.
*/
export function useTable(instances: RegistryFieldValues[], totalRows: number): TableDescriptor {
  const dict: Dictionary = useDictionary();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [sortParams, setSortParams] = useState<string>(genSortParams(sorting, dict.title));
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [data, setData] = useState<FieldValues[]>([]);
  const { startIndex, pagination, apiPagination, onPaginationChange } = useTablePagination();

  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    const newSorting: SortingState = typeof updater === "function" ? updater(sorting) : updater;
    setSorting(newSorting);
    const params: string = genSortParams(newSorting, dict.title);
    setSortParams(params);
  };

  const tableData: TableData = useMemo(
    () => {
      const output: TableData = parseDataForTable(instances, dict.title);
      return output;
    },
    [instances]
  );

  useEffect(() => {
    setData(tableData.data.slice(startIndex, startIndex + pagination.pageSize));
  }, [tableData, pagination.pageIndex]);

  const table: Table<FieldValues> = useReactTable({
    data,
    columns: tableData.columns,
    initialState: {
      pagination,
    },
    state: {
      columnFilters,
      sorting: sorting,
    },
    manualPagination: true,
    rowCount: totalRows,
    maxMultiSortColCount: 3,
    onPaginationChange,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId: (row, index) => row.id + index,
  });

  const firstActiveFilter: string = useFirstActiveFilter(columnFilters);

  return {
    table,
    data,
    setData,
    pagination,
    apiPagination,
    firstActiveFilter,
    sortParams,
  };
}
