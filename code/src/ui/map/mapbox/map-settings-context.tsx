import React, { createContext, useContext } from 'react';
import { MapSettings } from 'types/settings';

const MapSettingsContext = createContext<MapSettings | undefined>(undefined);

export const useMapSettings = () => {
    const context = useContext(MapSettingsContext);
    if (context === undefined) {
        throw new Error('useMapSettings must be used within a MapSettingsProvider');
    }
    return context;
};

interface MapSettingsProviderProps {
    settings: MapSettings;
    children: React.ReactNode;
}

export const MapSettingsProvider: React.FC<MapSettingsProviderProps> = ({ settings, children }) => {
    return (
        <MapSettingsContext.Provider value={settings}>
            {children}
        </MapSettingsContext.Provider>
    );
};