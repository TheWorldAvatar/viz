"use client";
import { useContext } from 'react';
import { SessionContext } from '@/utils/auth/SessionInfo';

export const useDefaultMenuExpanded = (): boolean => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useDefaultMenuExpanded must be used within a SessionProvider");
    }
    return context.defaultMenuExpanded;
};
