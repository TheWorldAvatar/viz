import { createSlice } from '@reduxjs/toolkit';
import { ReduxState } from 'app/store';

export const contextMenuSlice = createSlice({
    name: "contextMenu",
    initialState: {
        items: []
    },
    reducers: {
        addItem: (state, action) => {
            // Check for collision
            const match = state.items.find((item) =>
                item.id === action.payload.id
            );

            if (!match) {
                // Update state with new item
                state.items = state.items.concat(action.payload);
            }
        },
        removeItem: (state, action) => {
            state.items = state.items.filter(function (item) {
                return item.id !== action.payload.id
            })
        },
        toggleItem: (state, action) => {
            // Find entry by id
            const match = state.items.find((item) =>
                item.id === action.payload
            );

            // Set toggled state
            if(match) {
                match.toggled = !match.toggled;
            }
        }
    }
})

// Export selectors 
export const selectItems = (state: ReduxState) => state.contextMenu.items;
export const selectItem = (id: string) => (state: ReduxState) => {
    if (state?.contextMenu?.items == null) return null;
    return state.contextMenu.items.find((item) => item.id === id)
};

// Export the actions
export const { addItem, removeItem, toggleItem } = contextMenuSlice.actions;

// Export the reducer
export default contextMenuSlice.reducer;
