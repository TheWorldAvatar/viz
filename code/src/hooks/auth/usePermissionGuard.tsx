"use client"

import { usePermissionScheme } from 'hooks/auth/usePermissionScheme';
import { PermissionScheme, PermissionType } from 'types/auth';

/**
 * A custom hook to support authorisation checks based on permissions.
 */
export function usePermissionGuard(): (_permission: PermissionType) => boolean {
    const keycloakEnabled: boolean = process.env.KEYCLOAK === "true";
    const permissionScheme: PermissionScheme = usePermissionScheme();

    // A method to check if permitted by keycloak
    const isPermitted = (permission: PermissionType) => {
        // By default, if keycloak is disabled, everyone has permission
        // Else, the user must have the specified permission
        return !keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions[permission];
    };

    return isPermitted;
}
