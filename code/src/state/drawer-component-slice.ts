import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DrawerState {
  isOpen: boolean;
}

const initialState: DrawerState = {
  isOpen: false,
};

const drawerSlice = createSlice({
  name: "drawer",
  initialState,
  reducers: {
    openDrawer: (state) => {
      state.isOpen = true;
    },
    closeDrawer: (state) => {
      state.isOpen = false;
    },
    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
  },
});

// Export the actions
export const { openDrawer, closeDrawer, setDrawerOpen } = drawerSlice.actions;

// Export selectors
export const selectDrawerIsOpen = (state: { drawer: DrawerState }) =>
  state.drawer.isOpen;

// Export the reducer
export default drawerSlice.reducer;
