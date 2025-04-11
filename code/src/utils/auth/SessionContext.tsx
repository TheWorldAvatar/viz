"use client"

import React, { cache, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PermissionScheme, SessionInfo } from 'types/auth';
import { parsePermissions } from './session-utils';

const SessionContext = createContext<SessionInfo>(null);

export const SessionProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [session, setSession] = useState<SessionInfo>({
        userDisplayName: "",
        permissionScheme: null,
    });
    useEffect(() => {
        const fetchSession = cache(async () => {
            try {
                const response: Response = await fetch('/api/userinfo');
                if (response.ok) {
                    const session = await response.json();
                    setSession({
                        userDisplayName: session.name,
                        permissionScheme: parsePermissions(session.roles),
                    });
                }
            } catch (error) {
                console.warn('Error fetching session details:', error);
            }
        });
        if (process.env.KEYCLOAK) {
            fetchSession();
        }
    }, []);
    const memoSession = useMemo(() => session, [session]);
    return (
        <SessionContext.Provider value={memoSession}>
            {children}
        </SessionContext.Provider>
    );
};

export const useUserDisplayName = (): string => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useUserDisplayName must be used within a SessionProvider");
    }
    return context.userDisplayName;
};

export const usePermissionScheme = (): PermissionScheme => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("usePermissionScheme must be used within a SessionProvider");
    }
    return context.permissionScheme as PermissionScheme;
};

