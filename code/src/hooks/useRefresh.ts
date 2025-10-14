import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setApiLoading, setPendingRefresh } from 'state/api-loading-slice';

// Custom hook: useRefresh
const useRefresh = (): [boolean, () => void] => {
  const [refreshFlag, setRefreshFlag] = useState<boolean>(false);
  const dispatch = useDispatch();

  // Prevent unnecessary re-creations of the refresh function on every render
  const triggerRefresh = useCallback(() => {
    setRefreshFlag(true);
    dispatch(setPendingRefresh(true));
    dispatch(setApiLoading(false));
    setTimeout(() => setRefreshFlag(false), 500);
  }, [dispatch]);

  return [refreshFlag, triggerRefresh];
};

export default useRefresh;