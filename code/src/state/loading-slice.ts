import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReduxState } from "app/store";

interface LoadingState {
  isLoading: boolean;
  pendingRefresh: boolean; // Flag to trigger refresh when returning to the page
}

const initialState: LoadingState = {
  isLoading: false,
  pendingRefresh: false,
};

// Global loading state - when one approval is in progress, all approvals are blocked
const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

  },
});

// Export the actions
export const { setLoading } = loadingSlice.actions;

// Export selectors
export const selectIsLoading = (state: ReduxState) =>
  state.loading.isLoading;


// Export the reducer
export default loadingSlice.reducer;
