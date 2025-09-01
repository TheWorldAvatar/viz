import { ColumnFilter, ColumnFiltersState } from "@tanstack/react-table";
import { useEffect, useState } from "react";

/**
* A custom hook to track the first active filter of the columns.
*
* @param {ColumnFiltersState} columnFilters - The column filter state of the table.
*/
export function useFirstActiveFilter(
  columnFilters: ColumnFiltersState,
): string {
  const [firstActiveFilter, setFirstActiveFilter] = useState<string>(null);

  useEffect(() => {
    const activeFilters: ColumnFilter[] = columnFilters.filter(filter => (filter?.value as string[])?.length > 0);
    // If there is only one filter, update first filter
    if (activeFilters.length === 1) {
      setFirstActiveFilter(activeFilters[0].id);
    }
    // If there is no filter, reset first filter
    if (activeFilters.length === 0) {
      setFirstActiveFilter(null);
    }
  }, [columnFilters]);

  return firstActiveFilter
}
