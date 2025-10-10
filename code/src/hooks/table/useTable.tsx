import {
  ColumnFiltersState,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  Table,
  useReactTable
} from "@tanstack/react-table";
import { useDictionary } from "hooks/useDictionary";
import { useMemo, useState } from "react";
import { FieldValues } from "react-hook-form";
import { Dictionary } from "types/dictionary";
import { RegistryFieldValues } from "types/form";
import {
  parseDataForTable,
  TableData,
} from "ui/graphic/table/registry/registry-table-utils";
import { useFirstActiveFilter } from "./useFirstActiveFilter";

export interface TableDescriptor {
  table: Table<FieldValues>;
  data: FieldValues[];
  setData: React.Dispatch<React.SetStateAction<FieldValues[]>>,
  pagination: PaginationState,
  firstActiveFilter: string;
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
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [data, setData] = useState<FieldValues[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, // initial page index
    pageSize: 10, // default page size
  });

  const tableData: TableData = useMemo(
    () => {
      const output: TableData = parseDataForTable(instances, dict.title);
      setData(output.data);
      return output;
    },
    [instances]
  );
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
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
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
    firstActiveFilter,
  };
}
