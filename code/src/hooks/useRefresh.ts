'use client';

import { useState } from 'react';

interface useRefreshReturn {
  refreshFlag: boolean;
  triggerRefresh: () => void;
}

/**
 * A custom hook to trigger refresh.
 * 
 * @param {number} delay The delay for each refresh.

 */
const useRefresh = (delay: number): useRefreshReturn => {
  const [refreshFlag, setRefreshFlag] = useState<boolean>(false);
  const triggerRefresh = () => {
    setRefreshFlag(true);
    setTimeout(() => setRefreshFlag(false), delay);
  };

  return { refreshFlag, triggerRefresh };
}

export default useRefresh;