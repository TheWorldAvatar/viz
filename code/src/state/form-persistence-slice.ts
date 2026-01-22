import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReduxState } from "app/store";


interface FormPersistenceState {
    enabled: boolean;
    clearStoredFormData: boolean;
}

const initialState: FormPersistenceState = {
    enabled: false,
    clearStoredFormData: false,
};

/**
 * Redux slice for persisting form input values across the application.
 */
const formPersistenceSlice = createSlice({
    name: "formPersistence",
    initialState,
    reducers: {
        /**
           * Sets whether form data should be saved in memory (Session storage).
        */
        setFormPersistenceEnabled: (state, action: PayloadAction<boolean>) => {
            state.enabled = action.payload;
        },
        /**
         * Sets whether form data should be cleared.
         */
        setClearStoredFormData: (state, action: PayloadAction<boolean>) => {
            state.clearStoredFormData = action.payload;
        }
    },
})


export const { setFormPersistenceEnabled, setClearStoredFormData } = formPersistenceSlice.actions;
export const selectFormPersistenceEnabled = (state: ReduxState) => state.formPersistence.enabled;
export const selectClearStoredFormData = (state: ReduxState) => state.formPersistence.clearStoredFormData;
export default formPersistenceSlice.reducer;