import { createSlice } from "@reduxjs/toolkit";


interface DrawerSignalState {
    // Incremented each time a close is requested - drawer listens for changes
    closeSignal: number;
    // Tracks how many drawers have been opened in this navigation session
    drawerOpenCount: number;
}

const initialState: DrawerSignalState = {
    closeSignal: 0,
    drawerOpenCount: 0,
};

/**
 * Redux slice for managing drawer state and triggering drawer close from anywhere in the app.
 * Tracks how many drawers have been opened so we can handle sequential drawer navigation properly.
 */
const drawerSignalSlice = createSlice({
    name: "drawerSignal",
    initialState,
    reducers: {
        /**
         * Dispatch this action to trigger drawer close from anywhere.
         * The NavigationDrawer listens to closeSignal changes and closes when it changes.
         */
        triggerDrawerClose: (state) => {
            state.closeSignal += 1;
        },
        /**
         * Called when a drawer opens - increments the count
         */
        incrementDrawerCount: (state) => {
            state.drawerOpenCount += 1;
        },
        /**
         * Resets the drawer count back to 0 (called when navigating away from drawers)
         */
        resetDrawerCount: (state) => {
            state.drawerOpenCount = 0;
        },
    },
});

export const { triggerDrawerClose, incrementDrawerCount, resetDrawerCount } = drawerSignalSlice.actions;
export const selectCloseSignal = (state: { drawerSignal: DrawerSignalState }) => state.drawerSignal.closeSignal;
export const selectDrawerOpenCount = (state: { drawerSignal: DrawerSignalState }) => state.drawerSignal.drawerOpenCount;
export default drawerSignalSlice.reducer;
