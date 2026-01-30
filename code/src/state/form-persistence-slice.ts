import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReduxState } from "app/store";

interface FormPersistenceState {
    enabled: boolean;
    openFormCount: number;
}

const initialState: FormPersistenceState = {
    enabled: false,
    openFormCount: 0,
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
         * Sets the count of open forms that are persisting data.
        */
        setOpenFormCount: (state, action: PayloadAction<number>) => {
            state.openFormCount = action.payload;
        },
    },
})


export const { setFormPersistenceEnabled, setOpenFormCount } = formPersistenceSlice.actions;
export const selectFormPersistenceEnabled = (state: ReduxState) => state.formPersistence.enabled;
export const selectOpenFormCount = (state: ReduxState) => state.formPersistence.openFormCount;
export default formPersistenceSlice.reducer;