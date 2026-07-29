import { ColumnFiltersState } from "@tanstack/react-table";
import { RefObject, useCallback, useEffect, useRef } from "react";
import { DateRange } from "react-day-picker";
import { TableDescriptor } from "./useTable";

export interface TableScrollDescriptor {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  saveScrollPosition: (_scrollTop: number) => void;
  restoreScrollPosition: () => void;
  scrollToTop: () => void;
}

/**
 * A custom hook that manages the registry table's scroll position across refreshes.
 *
 * @param {TableDescriptor} tableDescriptor The table descriptor providing the sort/filter/pagination state.
 * @param {DateRange} selectedDate The currently selected date range.
 * @returns The scroll container ref to attach to the scrollable element, plus helpers to save,
 * restore, and reset the scroll position.
 */
export function useTableScroll(
  tableDescriptor: TableDescriptor,
  selectedDate: DateRange,
): TableScrollDescriptor {
  const scrollPositionRef = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const columnFilters: ColumnFiltersState = tableDescriptor.table.getState().columnFilters;
  const { sortParams, pagination } = tableDescriptor;
  const prevPageSize = useRef<number>(pagination.pageSize);

  const saveScrollPosition = (scrollTop: number) => {
    scrollPositionRef.current = scrollTop;
  };

  const restoreScrollPosition = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollPositionRef.current;
    }
  }, []);

  const scrollToTop = () => {
    scrollPositionRef.current = 0;
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Resets the scroll to top when a sort/filter/date/page change occurs. Page size change is excluded, so it keeps the position.
  const resetScrollToTop = () => {
    scrollPositionRef.current = 0;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  // Reset scroll to top on sort, filter, date, or page navigation, but keep it on a page-size change.
  useEffect(() => {
    const pageSizeChanged: boolean = prevPageSize.current !== pagination.pageSize;
    prevPageSize.current = pagination.pageSize;
    if (!pageSizeChanged) {
      resetScrollToTop();
    }
  }, [sortParams, columnFilters, selectedDate, pagination]);

  return { scrollContainerRef, saveScrollPosition, restoreScrollPosition, scrollToTop };
}
