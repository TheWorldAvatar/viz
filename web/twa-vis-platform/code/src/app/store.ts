
import { configureStore } from '@reduxjs/toolkit';
import contextMenuReducer from "state/context-menu-slice";
import ribbonComponentReducer from "state/ribbon-component-slice";
import floatingPanelReducer from "state/floating-panel-slice";
import layerTreeReducer from "state/layer-tree-slice";
import mapClickReducer from "state/floating-panel-click-slice";

// Initialise and export store
export const reduxStore = configureStore({
    reducer: {
        contextMenu: contextMenuReducer,
        ribbonComponents: ribbonComponentReducer,
        floatingPanel: floatingPanelReducer,
        layerTree: layerTreeReducer,
        mapClick: mapClickReducer
    }
});

// Export the type used for the store object.
export type ReduxStore = typeof reduxStore;

// Export the type used for the state object within the store.
export type ReduxState = ReturnType<typeof reduxStore.getState>;