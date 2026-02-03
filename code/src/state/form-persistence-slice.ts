import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReduxState } from "app/store";

interface FormPersistenceState {
    openFormCount: number;
    lockedFields: Record<string, number>;
}

const initialState: FormPersistenceState = {
    openFormCount: 0,
    lockedFields: {},
};

/**
 * Redux slice for persisting form input values across the application.
 */
const formPersistenceSlice = createSlice({
    name: "formPersistence",
    initialState,
    reducers: {
        /**
         * Sets the count of open forms that are persisting data.
        */
        setOpenFormCount: (state, action: PayloadAction<number>) => {
            state.openFormCount = action.payload;
        },
        /**
         * Sets the locked fields
         * Locked fields are parents fields , that we need to keep track of
         * in order to disable them when multiple forms are open
        */
        setLockedFields: (state, action: PayloadAction<Record<string, number>>) => {
            state.lockedFields = action.payload;
        }
    },
})


export const { setOpenFormCount, setLockedFields } = formPersistenceSlice.actions;
export const selectOpenFormCount = (state: ReduxState) => state.formPersistence.openFormCount;
export const selectLockedFields = (state: ReduxState) => state.formPersistence.lockedFields;
export default formPersistenceSlice.reducer;