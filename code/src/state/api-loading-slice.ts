import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReduxState } from "app/store";

interface ApiLoadingState {
  loadingRequests: Record<string, boolean>;
}

const initialState: ApiLoadingState = {
  loadingRequests: {},
};

// The key is used to track which row in the table is clicked
// When a user clicks "Approve" on Row 1, only Row 1's buttons are disabled.
// They can still interact with Row 2, Row 3, etc.
// Without keys: If a user clicks "Approve" on Row 1,
// ALL rows would show loading state and ALL approve buttons across all rows would be disabled.
const apiLoadingSlice = createSlice({
  name: "apiLoading",
  initialState,
  reducers: {
    setApiLoading: (
      state,
      action: PayloadAction<{ key: string; isLoading: boolean }>
    ) => {
      if (action.payload.isLoading) {
        state.loadingRequests[action.payload.key] = true;
      } else {
        delete state.loadingRequests[action.payload.key];
      }
    },
    clearApiLoading: (state, action: PayloadAction<string>) => {
      delete state.loadingRequests[action.payload];
    },
    clearAllApiLoading: (state) => {
      state.loadingRequests = {};
    },
  },
});

// Export the actions
export const { setApiLoading, clearApiLoading, clearAllApiLoading } =
  apiLoadingSlice.actions;

// Export selectors
export const selectIsApiLoading = (key: string) => (state: ReduxState) =>
  state.apiLoading.loadingRequests[key] === true;

export const selectHasAnyApiLoading = (state: ReduxState) =>
  Object.keys(state.apiLoading.loadingRequests).length > 0;

// Export the reducer
export default apiLoadingSlice.reducer;
