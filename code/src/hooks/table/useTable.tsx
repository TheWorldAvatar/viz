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
  firstActiveFilter: string;
}

/**
* A custom hook to parse the instances into functionalities for the registry table to function.
*
* @param {RegistryFieldValues[]} instances - The target instances.
*/
export function useTable(instances: RegistryFieldValues[]): TableDescriptor {
  const dict: Dictionary = useDictionary();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [data, setData] = useState<FieldValues[]>([]);

  const tableData: TableData = useMemo(
    () => {
      const output: TableData = parseDataForTable(instances, dict.title.blank);
      setData(output.data);
      return output;
    },
    [instances]
  );
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

  const firstActiveFilter: string = useFirstActiveFilter(columnFilters);

  return {
    table,
    data,
    setData,
    firstActiveFilter,
  };
}
