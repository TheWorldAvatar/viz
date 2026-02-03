'use client';

import { useDispatch, useSelector } from 'react-redux';
import { setOpenFormCount, setLockedFields, selectOpenFormCount, selectLockedFields } from 'state/form-persistence-slice';

interface useFormPersistenceStateReturn {
    openFormCount: number;
    lockedFields: Record<string, number>;
    clearPersistedFormState: () => void;
    setOpenFormCountValue: (_value: number) => void;
    setLockedFieldsValue: (_value: Record<string, number>) => void;
}

/**
 * Custom hook to manage form persistence state in Session Storage.
 * Provides access to form state values and functions to update them.
 */
const useFormPersistenceState = (): useFormPersistenceStateReturn => {
    const dispatch = useDispatch();
    const openFormCount: number = useSelector(selectOpenFormCount);
    const lockedFields: Record<string, number> = useSelector(selectLockedFields);

    const clearPersistedFormState = () => {
        dispatch(setOpenFormCount(0));
        dispatch(setLockedFields({}));
    };

    const setOpenFormCountValue = (value: number) => {
        dispatch(setOpenFormCount(value));
    };


    const setLockedFieldsValue = (value: Record<string, number>) => {
        dispatch(setLockedFields(value));
    };

    return { openFormCount, lockedFields, clearPersistedFormState, setOpenFormCountValue, setLockedFieldsValue };
};

export default useFormPersistenceState;
