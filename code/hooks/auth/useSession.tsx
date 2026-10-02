"use client";
import { useContext } from 'react';
import { SessionContext } from '@/utils/auth/SessionInfo';
import { SessionInfo } from '@/types/auth';

export const useSession = (): SessionInfo => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
};