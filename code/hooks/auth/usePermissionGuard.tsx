"use client"

import { PermissionType } from '@/types/auth';
import { useSession } from '@/hooks/auth/useSession';

/**
 * A custom hook to support authorisation checks based on permissions.
 */
export function usePermissionGuard(): (_permission: PermissionType) => boolean {
    const keycloakEnabled: boolean = process.env.KEYCLOAK.toLowerCase() === "true";
    const { permissionScheme } = useSession();

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
