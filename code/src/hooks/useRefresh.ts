import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsLoading, setLoading } from 'state/loading-slice';

interface UseRefreshReturn {
  refreshFlag: boolean;
  triggerRefresh: () => void;
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}



// Custom hook: useRefresh
const useRefresh = (): UseRefreshReturn => {
  const [refreshFlag, setRefreshFlag] = useState<boolean>(false);
  const dispatch = useDispatch();
  const isLoading: boolean = useSelector(selectIsLoading);

  // Prevent unnecessary re-creations of the refresh function on every render
  const triggerRefresh = useCallback(() => {
    setRefreshFlag(true);
    dispatch(setLoading(false));
    setTimeout(() => setRefreshFlag(false), 500);
  }, [dispatch]);

  const startLoading = () => {
    dispatch(setLoading(true));
  };

  const stopLoading = () => {
    dispatch(setLoading(false));
  };

  return { refreshFlag, triggerRefresh, isLoading, startLoading, stopLoading };
};

export default useRefresh;