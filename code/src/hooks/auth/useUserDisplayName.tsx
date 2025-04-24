"use client";
import { useContext } from 'react';
import { SessionContext } from 'utils/auth/SessionInfo';

export const useUserDisplayName = (): string => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useUserDisplayName must be used within a SessionProvider");
    }
    return context.userDisplayName;
};