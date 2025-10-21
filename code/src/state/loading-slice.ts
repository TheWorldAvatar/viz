import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReduxState } from "app/store";

interface LoadingState {
  isLoading: boolean;
  toastId: number | string;
}

const initialState: LoadingState = {
  isLoading: false,
  toastId: null,
};


// Global loading state - when one approval is in progress, all approvals are blocked
const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setToastId: (state, action: PayloadAction<number | string>) => {
      state.toastId = action.payload;
    },
  },
});

// Export the actions
export const { setLoading, setToastId } = loadingSlice.actions;

// Export selectors
export const selectIsLoading = (state: ReduxState) =>
  state.loading.isLoading;

export const selectToastId = (state: ReduxState) =>
  state.loading.toastId;


// Export the reducer
export default loadingSlice.reducer;
