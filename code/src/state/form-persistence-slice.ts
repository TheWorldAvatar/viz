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
        /**
         * Sets whether form data should be cleared.
         */
        setClearFormData: (state, action: PayloadAction<boolean>) => {
            state.clearFormData = action.payload;
        }
    },
})


export const { setFormPersistenceEnabled, setClearFormData } = formPersistenceSlice.actions;
export const selectFormPersistenceEnabled = (state: ReduxState) => state.formPersistence.enabled;
export const selectClearFormData = (state: ReduxState) => state.formPersistence.clearFormData;
export default formPersistenceSlice.reducer;