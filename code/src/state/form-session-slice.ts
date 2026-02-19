import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ColumnFilter } from "@tanstack/react-table";
import { ReduxState } from "app/store";

interface FormSession {
    formCount: number;
    frozenFields: Record<string, number>;
    invoiceAccountFilter: ColumnFilter;
}

const initialState: FormSession = {
    formCount: 0,
    frozenFields: {},
    invoiceAccountFilter: null,
};

/**
 * Redux slice for storing form session requirements across the application.
 */
const formSessionSlice = createSlice({
    name: "formSession",
    initialState,
    reducers: {
        setInvoiceAccountFilter: (state, action: PayloadAction<ColumnFilter>) => {
            state.invoiceAccountFilter = action.payload;
        },
        /**
         * Updates the number of forms that have been opened in the current session
        */
        setFormCount: (state, action: PayloadAction<number>) => {
            state.formCount = action.payload;
        },
        /**
         * Updates the fields that should be frozen along with their current form position for freezing
        */
        setFrozenFields: (state, action: PayloadAction<Record<string, number>>) => {
            state.frozenFields = action.payload;
        }
    },
})


export const { setInvoiceAccountFilter, setFormCount, setFrozenFields } = formSessionSlice.actions;
export const selectFormCount = (state: ReduxState) => state.formSession.formCount;
export const selectFrozenFields = (state: ReduxState) => state.formSession.frozenFields;
export const selectInvoiceAccountFilter = (state: ReduxState) => state.formSession.invoiceAccountFilter;
export default formSessionSlice.reducer;