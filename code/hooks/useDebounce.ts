'use client';

import { useEffect, useState } from 'react';

/**
 * Custom React hook to debounce a value change.
 * 
 * @param value The value to be debounced (e.g., user input).
 * @param delay The delay in milliseconds before the debounced value updates.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear previous timer if there are changes before the delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}