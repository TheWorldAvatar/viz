"use client"

import { usePermissionScheme } from 'hooks/auth/usePermissionScheme';
import { BUTTON_POLICIES, ButtonActionType, ButtonPolicy, PermissionScheme } from 'types/auth';
import { BillingStatus, LifecycleStage, RegistryStatus } from 'types/form';

export interface FilterOptionsDescriptor {
    isActionAllowed: (_action: ButtonActionType) => boolean;
}

/**
 * A custom hook to support authorisation checks to render components.
 * 
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {RegistryStatus} status The current task status.
 */
export function usePermissionGuard(
    lifecycleStage: LifecycleStage,
    status: RegistryStatus,
    billingStatus: BillingStatus) {
    const keycloakEnabled: boolean = process.env.KEYCLOAK === "true";
    const permissionScheme: PermissionScheme = usePermissionScheme();

    // A method to check if action is allowed based on button action
    const isActionAllowed = (action: ButtonActionType) => {
        const policy: ButtonPolicy = BUTTON_POLICIES[action];
        // By default, if keycloak is disabled, everyone has permission
        // Else, the user must have the specified permission
        const hasPermission: boolean = !keycloakEnabled ||
            !permissionScheme ||
            permissionScheme.hasPermissions[policy.permission];

        // If the remaining policy checks do not have any items to enforce, no check is needed
        const isValidStage: boolean = policy.stage.length === 0 || policy.stage.includes(lifecycleStage);
        const isValidStatus: boolean = policy.status.length === 0 || policy.status.includes(status);
        const isValidBillingStatus: boolean = policy.billingStatus.length === 0 || policy.billingStatus.includes(billingStatus);

        return hasPermission && isValidStage && isValidStatus && isValidBillingStatus;
    };

    return {
        isActionAllowed,
    };
}
