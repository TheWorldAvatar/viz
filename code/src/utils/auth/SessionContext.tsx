"use client"

import React, { cache, createContext, useContext, useEffect, useState } from 'react';

export type SessionToken = {
    name: string,
    hasSession: boolean,
    roles: string[],
};

const SessionContext = createContext<SessionToken | null>(null);

export const SessionProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [session, setSession] = useState<SessionToken>({ name: "", hasSession: false, roles: [] });
    useEffect(() => {
        const fetchSession = cache(async () => {
            try {
                const response: Response = await fetch('/session');
                if (response.ok) {
                    const session: SessionToken = await response.json();
                    setSession({
                        ...session,
                        hasSession: true,
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
    return (
        <SessionContext.Provider value={session}>
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
