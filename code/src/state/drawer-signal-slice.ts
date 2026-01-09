import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReduxState } from "app/store";

interface DrawerSignalState {
    isAnyDrawerOpen: boolean;
}

const initialState: DrawerSignalState = {
    isAnyDrawerOpen: false,
};

/**
 * Redux slice for managing drawer state and triggering drawer close from anywhere in the app.
 */
const drawerSignalSlice = createSlice({
    name: "drawerSignal",
    initialState,
    reducers: {
        setIsAnyDrawerOpen: (state, action: PayloadAction<boolean>) => {
            state.isAnyDrawerOpen = action.payload;
        }
    },
});

export const { setIsAnyDrawerOpen } = drawerSignalSlice.actions;
export const selectIsAnyDrawerOpen = (state: ReduxState) => state.drawerSignal.isAnyDrawerOpen;
export default drawerSignalSlice.reducer;
