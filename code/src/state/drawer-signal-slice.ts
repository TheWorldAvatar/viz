import { createSlice } from "@reduxjs/toolkit";


interface DrawerSignalState {
    // Incremented each time a close is requested - drawer listens for changes
    closeSignal: number;
}

const initialState: DrawerSignalState = {
    closeSignal: 0,
};

/**
 * Redux slice for triggering drawer close from anywhere in the app.
 * This does NOT track the drawer's open state - that remains local to the NavigationDrawer.
 * Instead, it provides a "signal" that the drawer listens to.
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
    },
});

export const { triggerDrawerClose } = drawerSignalSlice.actions;
export const selectCloseSignal = (state: { drawerSignal: DrawerSignalState }) => state.drawerSignal.closeSignal;
export default drawerSignalSlice.reducer;
