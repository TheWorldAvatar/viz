'use client';

import { useDispatch, useSelector } from 'react-redux';
import { setFormCount, setFrozenFields } from 'state/form-session-slice';
import { selectIsLoading, selectToastId, setLoading, setToastId } from 'state/loading-slice';
import { Dictionary } from 'types/dictionary';
import { toast } from "ui/interaction/action/toast/toast";
import { useDictionary } from './useDictionary';
import useRefresh from './useRefresh';

interface useOperationStatusReturn {
  refreshFlag: boolean;
  triggerRefresh: () => void;
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
  const { refreshFlag, triggerRefresh } = useRefresh(500);

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

  return { refreshFlag, triggerRefresh, isLoading, startLoading, stopLoading, resetFormSession };
};

export default useOperationStatus;