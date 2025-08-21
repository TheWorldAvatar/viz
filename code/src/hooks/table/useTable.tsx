import { useEffect, useMemo, useState } from "react";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import { FieldValues } from "react-hook-form";
import {
  parseDataForTable,
  TableData,
} from "ui/graphic/table/registry/registry-table-utils";
import { RegistryFieldValues } from "types/form";
import { Dictionary } from "types/dictionary";
import { useDictionary } from "hooks/useDictionary";

interface UseTableProps {
  currentInstances: RegistryFieldValues[];
}

interface UseTableReturn {
  table: Table<FieldValues>;
  tableData: TableData;
  data: FieldValues[];
  setData: React.Dispatch<React.SetStateAction<FieldValues[]>>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
}

export function useTable({ currentInstances }: UseTableProps): UseTableReturn {
  const dict: Dictionary = useDictionary();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const tableData: TableData = useMemo(
    () => parseDataForTable(currentInstances, dict.title.blank),
    [currentInstances]
  );

  const [data, setData] = useState<FieldValues[]>(tableData.data);

  // Update data when tableData changes
  useEffect(() => {
    setData(tableData.data);
  }, [tableData]);

  const table: Table<FieldValues> = useReactTable({
    data,
    columns: tableData.columns,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
    state: {
      columnFilters,
      sorting: sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId: (row, index) => row.id + index,
  });

  return {
    table,
    tableData,
    data,
    setData,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
  };
}
