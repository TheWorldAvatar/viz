import { ColumnFiltersState } from "@tanstack/react-table";
import { RefObject, useEffect, useRef } from "react";
import { DateRange } from "react-day-picker";
import { TableDescriptor } from "./useTable";

export interface TableScrollReturn {
  scrollPositionRef: RefObject<number>;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}

/**
 * A custom hook that manages the registry table's scroll position across refreshes.
 *
 * @param {TableDescriptor} tableDescriptor The table descriptor providing the sort/filter/pagination state.
 * @param {DateRange} selectedDate The currently selected date range.
 * @returns The refs to wire into the table: the persisted scroll position and the scroll container.
 */
export function useTableScroll(
  tableDescriptor: TableDescriptor,
  selectedDate: DateRange,
): TableScrollReturn {
  const scrollPositionRef = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const columnFilters: ColumnFiltersState = tableDescriptor.table.getState().columnFilters;
  const { sortParams, pagination } = tableDescriptor;
  const prevPageSize = useRef<number>(pagination.pageSize);

  const resetScrollToTop = () => {
    scrollPositionRef.current = 0;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  // Reset scroll to top on sort, filter, date, or page navigation
  // but keep it on a page-size change.
  useEffect(() => {
    const pageSizeChanged: boolean = prevPageSize.current !== pagination.pageSize;
    prevPageSize.current = pagination.pageSize;
    if (!pageSizeChanged) {
      resetScrollToTop();
    }
  }, [sortParams, columnFilters, selectedDate, pagination]);

  return { scrollPositionRef, scrollContainerRef };
}
