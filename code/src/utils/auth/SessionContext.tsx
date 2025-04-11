"use client"

import React, { cache, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PermissionScheme } from 'types/auth';
import { parsePermissions } from './session-utils';

type SessionToken = {
    name: string,
    hasSession: boolean,
    permissions?: PermissionScheme,
};

const SessionContext = createContext<SessionToken | null>(null);

export const SessionProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [session, setSession] = useState<SessionToken>({
        name: "",
        hasSession: process.env.KEYCLOAK === "true",
        permissions: null,
    });
    useEffect(() => {
        const fetchSession = cache(async () => {
            try {
                const response: Response = await fetch('/session');
                if (response.ok) {
                    const session = await response.json();
                    setSession({
                        name: session.name,
                        hasSession: true,
                        permissions: parsePermissions(session.roles),
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

export const useCurrentUser = (): string => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useCurrentUser must be used within a SessionProvider");
    }
    if (!context.hasSession) {
        return null;
    }
    return context.name;
};

export const usePermissionScheme = (): PermissionScheme => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("usePermissionScheme must be used within a SessionProvider");
    }
    if (!context.hasSession) {
        return {
            route: null,
            disabled: true, // No login session is present
        };
    }
    return context.permissions;
};

