'use client';

import { useDispatch, useSelector } from 'react-redux';
import { selectFormCount, selectFrozenFields, setFormCount, setFrozenFields } from 'state/form-session-slice';

interface useFormSessionReturn {
    formCount: number;
    frozenFields: Record<string, number>;
    incrementFormCount: () => void;
    decrementFormCount: () => void;
    addFrozenFields: (_fields: string[]) => void;
    handleFormClose: () => void;
    resetFormSession: () => void;
}

/**
 * Manages the current form session, from tracking the number of open forms, frozen fields
 * in the current session, and provide functionality to update them accordingly.
 */
const useFormSession = (): useFormSessionReturn => {
    const dispatch = useDispatch();
    const formCount: number = useSelector(selectFormCount);
    const frozenFields: Record<string, number> = useSelector(selectFrozenFields);

    const incrementFormCount = (): void => {
        dispatch(setFormCount(formCount + 1));
    };
    const decrementFormCount = (): void => {
        dispatch(setFormCount(formCount - 1));
    };

    /** Adds the frozen fields if they are not already present in the state
     * 
     * @param {string[]} fields  The fields that should be frozen.
     */
    const addFrozenFields = (fields: string[]): void => {
        const tempLockedFields: Record<string, number> = { ...frozenFields };
        fields.forEach((field: string) => {
            if (tempLockedFields[field] == undefined) {
                // Stores the current form position for the frozen field
                tempLockedFields[field] = formCount;
            }
        });
        dispatch(setFrozenFields(tempLockedFields));
    };

    const resetFormSession = (): void => {
        dispatch(setFormCount(0));
        dispatch(setFrozenFields({}));
    };

    /** Handles the form close operations including decrementing form count and removing old frozen fields.
     */
    const handleFormClose = (): void => {
        const updatedFrozenFields: Record<string, number> = { ...frozenFields };
        // Redux cannot update form count and read it in one operation
        const newFormCount: number = formCount - 1;
        Object.keys(updatedFrozenFields).forEach((fieldName) => {
            if (newFormCount < updatedFrozenFields[fieldName]) {
                delete updatedFrozenFields[fieldName];
            }
        });
        decrementFormCount();
        dispatch(setFrozenFields(updatedFrozenFields));
    };

    return { formCount, frozenFields, resetFormSession, incrementFormCount, decrementFormCount, addFrozenFields, handleFormClose };
};

export default useFormSession;
