import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReduxState } from "app/store";


interface FormPersistenceState {
    enabled: boolean;
    clearFormData: boolean;
}

const initialState: FormPersistenceState = {
    enabled: false,
    clearFormData: false,
};

/**
 * Redux slice for persisting arbitrary form input values across the application.
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
        setClearFormData: (state, action: PayloadAction<boolean>) => {
            state.clearFormData = action.payload;
        }
        // Completely clears the memory for a specific form
        // clearFormData: (state, action: PayloadAction<string>) => {
        //     state.saveInMemory = false;
        // },
        // // Resets all form memory
        // resetAllForms: (state) => {
        //     state.saveInMemory = false;
        // },
    },
})


export const { setFormPersistenceEnabled, setClearFormData } = formPersistenceSlice.actions;
export const selectFormPersistenceEnabled = (state: ReduxState) => state.formPersistence.enabled;
export const selectClearFormData = (state: ReduxState) => state.formPersistence.clearFormData;
export default formPersistenceSlice.reducer;