import {
  OnChangeFn,
  PaginationState
} from "@tanstack/react-table";
import { useState } from "react";

export interface PaginationDescriptor {
  startIndex: number;
  pagination: PaginationState,
  apiPagination: PaginationState,
  onPaginationChange: OnChangeFn<PaginationState>;
}

// When client requests the page sizes of the keys, the API will return the multiplier value
// to the page sizes to get preloaded data
const API_PAGE_SIZE_MULTIPLIER_MAP: Record<number, number> = {
  10: 10,
  20: 10,
  50: 5,
  100: 2,
};

/**
* A custom hook to handle the table pagination states.
*/
export function useTablePagination(): PaginationDescriptor {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, // initial page index
    pageSize: 10, // default page size
  });
  const [apiPagination, setApiPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10 * API_PAGE_SIZE_MULTIPLIER_MAP[10], // Pre-fetch ten times the default page size
  });

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const newClientPagination: PaginationState = typeof updater === "function" ? updater(pagination) : updater;
    // Reset to first page if page size changes
    if (pagination.pageSize != newClientPagination.pageSize) {
      newClientPagination.pageIndex = 0;
      // Pre-fetch five times the client page size
      setApiPagination({
        pageIndex: 0,
        pageSize: newClientPagination.pageSize * API_PAGE_SIZE_MULTIPLIER_MAP[newClientPagination.pageSize],
      });
    } else {
      // For page index changes, verify if the API page boundary has been crossed (e.g., going from page 9 to 10, or 11 to 10)
      const multiplier: number = API_PAGE_SIZE_MULTIPLIER_MAP[pagination.pageSize]; // multiplier is equal as both page sizes are equal
      const prevApiPageIndex: number = Math.floor(pagination.pageIndex / multiplier);
      const newApiPageIndex: number = Math.floor(newClientPagination.pageIndex / multiplier);
      // Update API pagination if boundary is crossed
      if (prevApiPageIndex != newApiPageIndex) {
        setApiPagination({
          pageIndex: newApiPageIndex,
          pageSize: apiPagination.pageSize,
        });
      }
    }
    setPagination(newClientPagination);
  };

  return {
    startIndex: pagination.pageIndex % API_PAGE_SIZE_MULTIPLIER_MAP[pagination.pageSize] * pagination.pageSize,
    pagination,
    apiPagination,
    onPaginationChange,
  };
}
