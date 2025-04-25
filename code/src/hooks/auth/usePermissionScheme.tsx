"use client";
import { useContext } from 'react';
import { PermissionScheme } from 'types/auth';
import { SessionContext } from 'utils/auth/SessionInfo';


export const usePermissionScheme = (): PermissionScheme => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("usePermissionScheme must be used within a SessionProvider");
    }
    return context.permissionScheme as PermissionScheme;
};
