import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReduxState } from 'app/store';

interface RegistrySliceState {
    currentEntityType: string;
}

const initialState: RegistrySliceState = {
    currentEntityType: "",
};

export const registrySlice = createSlice({
    name: "registry",
    initialState,
    reducers: {
        setCurrentEntityType: (state, action: PayloadAction<string>) => {
            state.currentEntityType = action.payload;
        }
    }
})

export const getCurrentEntityType = (state: ReduxState) => state.registry.currentEntityType;

// Export the actions
export const { setCurrentEntityType } = registrySlice.actions;

// Export the reducer
export default registrySlice.reducer;
