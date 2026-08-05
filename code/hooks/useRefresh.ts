'use client';

import { useState } from 'react';

export interface useRefreshReturn {
  refreshId: number;
  refreshFlag: boolean;
  triggerRefresh: () => void;
}

/**
 * A custom hook to trigger refresh.
 * 
 * @param {number} delay The delay for each refresh.
 */
const useRefresh = (delay: number): useRefreshReturn => {
  // A counter to trigger UseEffects once rather than twice
  const [refreshId, setRefreshId] = useState<number>(0);
  // A flag to rerender each component on condition
  const [refreshFlag, setRefreshFlag] = useState<boolean>(false);
  const triggerRefresh = () => {
    setRefreshFlag(true);
    setRefreshId(prev => prev + 1);
    setTimeout(() => setRefreshFlag(false), delay);
  };

  return { refreshId, refreshFlag, triggerRefresh };
}

export default useRefresh;