import React, { useEffect } from "react";

/**
 * Custom useEffect that skips execution on the initial mount 
 * and only runs on subsequent dependency updates.
 */
export const useAfterMount = (
  effect: React.EffectCallback,
  deps?: React.DependencyList
): void => {
  const isMounted: React.RefObject<boolean> = React.useRef<boolean>(false);
  useEffect(() => {
    // If this is the initial render, do not perform the effect
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }


    // Reset when Strict Mode unmounts the component on initial load
    return () => {
      isMounted.current = false;
      if (typeof effect === 'function') {
        effect();
      }
    };
    // eslint-disable-next-deps
  }, deps);
};
