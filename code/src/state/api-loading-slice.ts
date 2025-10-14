import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReduxState } from "app/store";

interface ApiLoadingState {
  isLoading: boolean;
  pendingRefresh: boolean; // Flag to trigger refresh when returning to the page
}

const initialState: ApiLoadingState = {
  isLoading: false,
  pendingRefresh: false,
};

// Global loading state - when one approval is in progress, all approvals are blocked
const apiLoadingSlice = createSlice({
  name: "apiLoading",
  initialState,
  reducers: {
    setApiLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setPendingRefresh: (state, action: PayloadAction<boolean>) => {
      state.pendingRefresh = action.payload;
    },
  },
});

// Export the actions
export const { setApiLoading, setPendingRefresh } = apiLoadingSlice.actions;

// Export selectors
export const selectIsApiLoading = (state: ReduxState) =>
  state.apiLoading.isLoading;

export const selectPendingRefresh = (state: ReduxState) =>
  state.apiLoading.pendingRefresh;

// Export the reducer
export default apiLoadingSlice.reducer;
