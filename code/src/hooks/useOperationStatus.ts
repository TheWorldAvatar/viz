'use client';

import { useState, useCallback, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsLoading, selectToastId, setLoading, setToastId } from 'state/loading-slice';
import { toast } from "sonner"

interface useOperationStatusReturn {
  refreshFlag: boolean;
  triggerRefresh: () => void;
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

/**
 * A custom hook to track the status of any operation to set loading status and trigger refreshes as needed.
 */
const useOperationStatus = (): useOperationStatusReturn => {
  const [refreshFlag, setRefreshFlag] = useState<boolean>(false);
  const dispatch = useDispatch();
  const isLoading: boolean = useSelector(selectIsLoading);
  const toastId = useSelector(selectToastId);

  // Prevent unnecessary re-creations of the refresh function on every render
  const triggerRefresh = useCallback(() => {
    setRefreshFlag(true);
    setTimeout(() => setRefreshFlag(false), 500);
  }, [dispatch]);

  const startLoading = () => {
    const id = toast.loading('Loading data, please wait...', {
      className: "!w-full !py-8"
    });
    dispatch(setToastId(id));
    dispatch(setLoading(true))
  }

  const stopLoading = () => {
    dispatch(setToastId(null));
    toast.dismiss(toastId);
    dispatch(setLoading(false));
  }

  return { refreshFlag, triggerRefresh, isLoading, startLoading, stopLoading };
};

export default useOperationStatus;