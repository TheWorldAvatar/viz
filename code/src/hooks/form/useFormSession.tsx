'use client';

import { FieldValues } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { browserStorageManager } from 'state/browser-storage-manager';
import { selectFormCount, selectFrozenFields, setFormCount, setFrozenFields } from 'state/form-session-slice';
import { FORM_STATES } from 'ui/interaction/form/form-utils';

interface useFormSessionReturn {
    formCount: number;
    frozenFields: Record<string, number>;
    incrementFormCount: () => void;
    addFrozenFields: (_fields: string[]) => void;
    handleFormClose: () => void;
    resetFormSession: () => void;
    loadPreviousSession: (_formId: string, _initialState: FieldValues) => FieldValues;
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
        const newFormCount: number = formCount - 1;
        Object.keys(updatedFrozenFields).forEach((fieldName) => {
            if (newFormCount < updatedFrozenFields[fieldName]) {
                delete updatedFrozenFields[fieldName];
            }
        });
        dispatch(setFormCount(newFormCount));
        dispatch(setFrozenFields(updatedFrozenFields));
    };

    /** Loads the previous form session for the current form.
     * 
     * @param {string} formId  The unique form ID.
     * @param {FieldValues} initialState  The initial state for the form.
     */
    const loadPreviousSession = (formId: string, initialState: FieldValues): FieldValues => {
        const excludedFields: string[] = [FORM_STATES.FORM_TYPE, FORM_STATES.ID];

        // Load the values stored in the form ID, usually for input fields, branch names
        const entityForm: string = browserStorageManager.get(formId);
        if (entityForm) {
            try {
                const nestedValues: FieldValues = JSON.parse(entityForm);
                Object.entries(nestedValues).forEach(([storageKey, value]) => {
                    if (!excludedFields.includes(storageKey)) {
                        initialState[storageKey] = value;
                    }
                });
            } catch (e) {
                console.error("Failed to load previous form data for: ", formId, e);
            }
        }
        return initialState;
    };

    return {
        formCount,
        frozenFields,
        resetFormSession,
        incrementFormCount,
        addFrozenFields,
        handleFormClose,
        loadPreviousSession,
    };
};

export default useFormSession;
