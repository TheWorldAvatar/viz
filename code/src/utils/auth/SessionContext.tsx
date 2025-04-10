"use client"

import { Routes } from 'io/config/routes';
import React, { cache, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PermissionScheme } from 'types/auth';

type SessionToken = {
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
    const [session, setSession] = useState<SessionToken>({ name: "", hasSession: process.env.KEYCLOAK === "true", roles: [] });
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
    const permissionScheme: PermissionScheme = {
        route: null,
        pendingRegistry: false,
        activeArchiveRegistry: false,
        export: false,
        invoice: false,
        sales: false,
        operation: false,
        viewTask: false,
        completeTask: false,
        reportTask: false,
    }
    if (context.roles.length === 0) {
        return permissionScheme;
    }

    // Access to different registry depends on roles
    if (context.roles.includes("registry-navigation")) {
        permissionScheme.pendingRegistry = true;
        permissionScheme.activeArchiveRegistry = true;
    } else if (context.roles.includes("registry-navigation-pending")) {
        // Users with only access to the pending registry cannot access other registries
        permissionScheme.route = Routes.REGISTRY_PENDING;
    } else if (context.roles.includes("registry-navigation-active-archive")) {
        // Users with only access to the active and archive registry cannot access the pending registry
        // and will be redirected
        permissionScheme.route = Routes.REGISTRY_ACTIVE;
        permissionScheme.activeArchiveRegistry = true;
    }

    // Roles with access to only specific routes
    if (context.roles.includes("task-viewer")) {
        permissionScheme.route = Routes.REGISTRY_TASK_DATE;
        permissionScheme.completeTask = true;
        permissionScheme.reportTask = true;
    }
    if (context.roles.includes("finance")) {
        permissionScheme.route = Routes.REGISTRY_ACTIVE;
        permissionScheme.invoice = true;
    }

    // General permissions
    if (context.roles.includes("sales")) {
        permissionScheme.sales = true;
    }
    if (context.roles.includes("operations")) {
        permissionScheme.operation = true;
        permissionScheme.viewTask = true;
        permissionScheme.completeTask = true;
        permissionScheme.reportTask = true;
    }
    if (context.roles.includes("export")) {
        permissionScheme.export = true;
    }
    return permissionScheme;
};
