import { createSlice } from "@reduxjs/toolkit";

interface DrawerSignalState {
    // Signal to trigger drawer close
    closeSignal: boolean;
    // Tracks how many drawers have been opened in this navigation session
    drawerOpenCount: number;
}

const initialState: DrawerSignalState = {
    closeSignal: false,
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
          if(state.drawerOpenCount > 0){
            state.closeSignal = true;
          }
        },
          /**
         * Resets the close signal back to false after a drawer has closed.
         * Should only be called internally by NavigationDrawer.
         */
        resetCloseSignal: (state) => {
            state.closeSignal = false;
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

export const { triggerDrawerClose, incrementDrawerCount, resetDrawerCount, resetCloseSignal } = drawerSignalSlice.actions;
export const selectCloseSignal = (state: { drawerSignal: DrawerSignalState }) => state.drawerSignal.closeSignal;
export const selectDrawerOpenCount = (state: { drawerSignal: DrawerSignalState }) => state.drawerSignal.drawerOpenCount;
export default drawerSignalSlice.reducer;
