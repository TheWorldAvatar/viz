'use client';

import { ColumnFilter } from '@tanstack/react-table';
import { useContext } from 'react';
import { FieldValues } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { browserStorageManager } from 'state/browser-storage-manager';
import { selectFormCount, selectFrozenFields, selectInvoiceAccountFilter, setFormCount, setFrozenFields, setInvoiceAccountFilter } from 'state/form-session-slice';
import { FORM_STATES } from 'ui/interaction/form/form-utils';
import { FormSessionContext, FormSessionState } from 'utils/form/FormSessionContext';

interface useFormSessionReturn extends FormSessionState {
    formCount: number;
    invoiceAccountFilter: ColumnFilter;
    frozenFields: Record<string, number>;
    updateInvoiceAccount: (_account: string) => void;
    addFrozenFields: (_fields: string[]) => void;
    handleFormClose: () => void;
    saveCurrentSession: (_initialState: FieldValues) => void;
    loadPreviousSession: (_initialState: FieldValues) => FieldValues;
}

/**
 * Manages the current form session, from tracking the number of open forms, frozen fields
 * in the current session, and provide functionality to update them accordingly.
 */
const useFormSession = (): useFormSessionReturn => {
    const dispatch = useDispatch();
    const formSession: FormSessionState = useContext(FormSessionContext);
    if (!formSession) {
        throw new Error("useFormSession must be used within a FormSessionContextProvider");
    }
    const excludedFields: string[] = [FORM_STATES.FORM_TYPE, FORM_STATES.ID];
    const invoiceAccountFilter: ColumnFilter = useSelector(selectInvoiceAccountFilter);
    const formCount: number = useSelector(selectFormCount);
    const frozenFields: Record<string, number> = useSelector(selectFrozenFields);

    /** Update invoice account.
     * 
     * @param {string} account  Updates the account.
     */
    const updateInvoiceAccount = (account: string): void => {
        dispatch(setInvoiceAccountFilter({
            id: formSession.accountType,
            value: [account],
        }));
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

    /** Saves the current form data to the session storage and increment form counter 
     * as saving usually occurs before moving to the next form.
     * 
     * @param {FieldValues} formData  The current form data.
     */
    const saveCurrentSession = (formData: FieldValues): void => {
        // Increment form count
        dispatch(setFormCount(formCount + 1));

        const dataTypeValues: Record<string, string> = {};
        Object.entries(formData).forEach(([key, value]) => {
            // Skip excluded fields
            if (excludedFields.includes(key) || key.startsWith("_form_")) return;
            // If the field ID mapping exists for dropdown fields, use the field name
            if (formSession.fieldIdNameMapping && formSession.fieldIdNameMapping[key]) {
                browserStorageManager.set(formSession.fieldIdNameMapping[key], value);
            } else {
                // Save individual field
                dataTypeValues[key] = value;
            }
        });
        // Save all other fields under a single identifier
        if (Object.keys(dataTypeValues).length) {
            browserStorageManager.set(formSession.id, JSON.stringify(dataTypeValues));
        }
    }


    /** Loads the previous form session for non-dropdowns for the current form.
     * 
     * @param {FieldValues} initialState  The initial state for the form.
     */
    const loadPreviousSession = (initialState: FieldValues): FieldValues => {
        // Load the values stored in the form ID, usually for input fields, branch names
        const previousSessionData: string = browserStorageManager.get(formSession.id);
        if (previousSessionData) {
            try {
                // Override the initial state with the saved values from the previous session
                const overrides: FieldValues = JSON.parse(previousSessionData);
                initialState = { ...initialState, ...overrides };
            } catch (e) {
                console.error("Failed to load previous form data for: ", formSession.id, e);
            }
        }
        return initialState;
    };

    return {
        ...formSession,
        invoiceAccountFilter,
        formCount,
        frozenFields,
        updateInvoiceAccount,
        addFrozenFields,
        handleFormClose,
        saveCurrentSession,
        loadPreviousSession,
    };
};

export default useFormSession;
