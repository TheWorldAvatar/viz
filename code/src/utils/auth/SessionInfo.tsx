"use client"

import React, { cache, createContext, useEffect, useMemo, useState } from 'react';
import { SessionInfo } from 'types/auth';
import { parsePermissions } from './session-utils';

export const SessionContext = createContext<SessionInfo>(null);




export const SessionInfoProvider = ({
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
}
