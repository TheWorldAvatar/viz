import { configureStore } from "@reduxjs/toolkit";
import { featureInfoAgentApi } from "state/api/fia-api";
import contextMenuReducer from "state/context-menu-slice";
import dimensionSliderSlice from "state/dimension-slider-slice";
import drawerSignalReducer from "state/drawer-signal-slice";
import floatingPanelReducer from "state/floating-panel-slice";
import formSessionReducer from "state/form-session-slice";
import loadingReducer from "state/loading-slice";
import mapFeatureReducer from "state/map-feature-slice";
import ribbonComponentReducer from "state/ribbon-component-slice";

// Initialise and export store
export const reduxStore = configureStore({
  reducer: {
    contextMenu: contextMenuReducer,
    drawerSignal: drawerSignalReducer,
    ribbonComponents: ribbonComponentReducer,
    floatingPanel: floatingPanelReducer,
    mapFeature: mapFeatureReducer,
    dimensionSlider: dimensionSliderSlice,
    formSession: formSessionReducer,
    loading: loadingReducer,
    [featureInfoAgentApi.reducerPath]: featureInfoAgentApi.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling, and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(featureInfoAgentApi.middleware),
});

// Export the type used for the store object.
export type ReduxStore = typeof reduxStore;

// Export the type used for the state object within the store.
export type ReduxState = ReturnType<typeof reduxStore.getState>;
