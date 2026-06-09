'use client';

import { useDispatch, useSelector } from 'react-redux';
import { setFormCount, setFrozenFields } from 'state/form-session-slice';
import { selectIsLoading, selectToastId, setLoading, setToastId } from 'state/loading-slice';
import { Dictionary } from 'types/dictionary';
import { toast } from "ui/interaction/action/toast/toast";
import { useDictionary } from './useDictionary';
import useRefresh, { useRefreshReturn } from './useRefresh';

interface useOperationStatusReturn extends useRefreshReturn {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  resetFormSession: () => void;
}

/**
 * A custom hook to track the status of any operation to set loading status and trigger refreshes as needed.
 */
const useOperationStatus = (): useOperationStatusReturn => {
  const dict: Dictionary = useDictionary();
  const dispatch = useDispatch();
  const isLoading: boolean = useSelector(selectIsLoading);
  const toastId: number | string = useSelector(selectToastId);
  const useRefreshReturn: useRefreshReturn = useRefresh(500);

  const startLoading = () => {
    const id: number | string = toast(dict.message.processingRequest, "loading");
    dispatch(setToastId(id));
    dispatch(setLoading(true));
  }

  const stopLoading = () => {
    dispatch(setToastId(null));
    toast.dismiss(toastId);
    dispatch(setLoading(false));
  }
  const resetFormSession = (): void => {
    dispatch(setFormCount(0));
    dispatch(setFrozenFields({}));
  };

  return { ...useRefreshReturn, isLoading, startLoading, stopLoading, resetFormSession };
};

export default useOperationStatus;