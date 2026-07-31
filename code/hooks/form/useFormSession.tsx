'use client';

import { browserStorageManager } from '@/state/browser-storage-manager';
import { selectFormCount, selectFrozenFields, selectInvoiceAccountFilter, setFormCount, setFrozenFields, setInvoiceAccountFilter } from '@/state/form-session-slice';
import { FORM_STATES } from '@/ui/interaction/form/form-utils';
import { PREV_SESSION_KEY } from '@/utils/constants';
import { FormSessionContext, FormSessionState } from '@/utils/form/FormSessionContext';
import { ColumnFilter } from '@tanstack/react-table';
import { useContext } from 'react';
import { FieldValues } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

interface useFormSessionReturn extends FormSessionState {
    formCount: number;
    invoiceAccountFilter: ColumnFilter;
    frozenFields: Record<string, number>;
    updateInvoiceAccount: (_account: string) => void;
    addFrozenFields: (_fields: string[]) => void;
    handleFormClose: () => void;
    saveCurrentSession: (_initialState: FieldValues, _sessionId?: string) => void;
    updatePreviousSession: (_formData: FieldValues) => void;
    loadPreviousSession: (_initialState: FieldValues, _fieldIdNameMapping: Record<string, string>) => FieldValues;
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
    const excludedFields: string[] = [FORM_STATES.ID];
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
     * @param {string} sessionId Optionally saves the session into a target form based on this type.
     */
    const saveCurrentSession = (formData: FieldValues, sessionId?: string): void => {
        // Increment form count
        dispatch(setFormCount(formCount + 1));
        updateSessionHistory(formSession.id);

        const dataTypeValues: Record<string, string> = {};
        Object.entries(formData).forEach(([key, value]) => {
            // Skip excluded fields
            if (excludedFields.includes(key) || key.startsWith("_form_")) return;
            // If the field ID mapping exists for dropdown fields, use the field name
            if (formSession.fieldIdNameMapping && formSession.fieldIdNameMapping[key]) {
                // If there is a future session opening, store only the field and nothing else
                if (sessionId) {
                    dataTypeValues[formSession.fieldIdNameMapping[key]] = value;
                } else {
                    dataTypeValues[key] = value;
                }
                browserStorageManager.set(formSession.fieldIdNameMapping[key], value);
            } else if (!sessionId) {
                // For non-dropdown fields of the current form
                dataTypeValues[key] = value;
            }
        });
        // Save all other fields under a single identifier
        if (Object.keys(dataTypeValues).length) {
            browserStorageManager.set(sessionId ? formSession.genFormSessionId(sessionId) : formSession.id,
                JSON.stringify(dataTypeValues));
        }
    }

    /** Stores the various form session id to track history of changes.
    * 
    * @param {string} sessionId  The current session id.
    */
    const updateSessionHistory = (sessionId: string): void => {
        const sessions: string[] = browserStorageManager.get(PREV_SESSION_KEY) ? JSON.parse(browserStorageManager.get(PREV_SESSION_KEY)) : [];

        // Do not push duplicates
        if (!sessions.some(session => session === sessionId)) {
            sessions.push(sessionId);
            browserStorageManager.set(PREV_SESSION_KEY, JSON.stringify(sessions));
        }
    }

    /** Updates all previous session with the data.
    * 
    * @param {FieldValues} formData  The data to be updated.
    */
    const updatePreviousSession = (formData: FieldValues): void => {
        const sessions: string[] = browserStorageManager.get(PREV_SESSION_KEY) ? JSON.parse(browserStorageManager.get(PREV_SESSION_KEY)) : [];
        sessions.forEach(session => {
            const prevSessionRawData: string = browserStorageManager.get(session);
            let prevSessionData: FieldValues = prevSessionRawData ? JSON.parse(prevSessionRawData) : {};
            prevSessionData = {
                ...prevSessionData,
                ...formData,
            }
            browserStorageManager.set(session, JSON.stringify(prevSessionData));
        });

    }

    /** Loads the previous form session for non-dropdowns for the current form and stores the field id name mapping.
     * 
     * @param {FieldValues} initialState  The initial state for the form.
     * @param {Record<string, string>} fieldIdNameMapping  Mappings between field id and name.
     */
    const loadPreviousSession = (initialState: FieldValues, fieldIdNameMapping: Record<string, string>): FieldValues => {
        formSession.setFieldIdNameMapping(fieldIdNameMapping);
        // Load the values stored in the form ID, usually for input fields, branch names
        const previousSessionData: string = browserStorageManager.get(formSession.id);
        if (previousSessionData) {
            const updatedState: FieldValues = { ...initialState };
            try {
                // Override the initial state with the saved values from the previous session
                const overrides: FieldValues = JSON.parse(previousSessionData);
                for (const [overrideKey, overrideValue] of Object.entries(overrides)) {
                    for (const [fieldId, fieldName] of Object.entries(fieldIdNameMapping)) {
                        // Early break if override key is found
                        if (fieldId == overrideKey || fieldName == overrideKey) {
                            updatedState[fieldId] = overrideValue;
                            continue;
                        }
                    }

                    // If they are not found in the mappings above, they are non-dropdown and should overwrite
                    updatedState[overrideKey] = overrideValue;
                }
                initialState = updatedState;
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
        updatePreviousSession,
        loadPreviousSession,
    };
};

export default useFormSession;
