import { RefObject, useCallback, useRef } from "react";

export interface TableScrollDescriptor {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  saveScrollPosition: (_scrollTop: number) => void;
  restoreScrollPosition: () => void;
  scrollToTop: () => void;
  resetScrollToTop: () => void;
}

/**
 * A custom hook that manages the registry table's scroll position across refreshes.
 *
 * @returns The scroll container ref to attach to the scrollable element, plus helpers to save,
 * restore, and reset the scroll position.
 */
export function useTableScroll(): TableScrollDescriptor {
  const scrollPositionRef = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Resets the scroll to the top; called from event handlers when a sort/filter/date/page change occurs.
  const resetScrollToTop = () => {
    scrollPositionRef.current = 0;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  return { scrollContainerRef, saveScrollPosition, restoreScrollPosition, scrollToTop, resetScrollToTop };
}
