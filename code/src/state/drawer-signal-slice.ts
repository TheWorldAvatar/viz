import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReduxState } from "app/store";

interface DrawerSignalState {
    // Signal to trigger drawer close
    closeSignal: boolean;
    isAnyDrawerOpen: boolean;
}

const initialState: DrawerSignalState = {
    closeSignal: false,
    isAnyDrawerOpen: false,
};

/**
 * Redux slice for managing drawer state and triggering drawer close from anywhere in the app.
 */
const drawerSignalSlice = createSlice({
    name: "drawerSignal",
    initialState,
    reducers: {
        setCloseSignal: (state, action: PayloadAction<boolean>) => {
            state.closeSignal = action.payload;
        },
        setIsAnyDrawerOpen: (state, action: PayloadAction<boolean>) => {
            state.isAnyDrawerOpen = action.payload;
        }
    },
});

export const { setCloseSignal, setIsAnyDrawerOpen } = drawerSignalSlice.actions;
export const selectCloseSignal = (state: ReduxState) => state.drawerSignal.closeSignal;
export const selectIsAnyDrawerOpen = (state: ReduxState) => state.drawerSignal.isAnyDrawerOpen;
export default drawerSignalSlice.reducer;
