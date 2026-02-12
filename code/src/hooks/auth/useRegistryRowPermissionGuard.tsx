"use client"

import { BUTTON_POLICIES, ButtonActionType, ButtonPolicy } from 'types/auth';
import { LifecycleStage, RegistryStatus } from 'types/form';
import { usePermissionGuard } from './usePermissionGuard';

/**
 * A custom hook to support authorisation checks to render components for a registry row.
 * 
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {RegistryStatus} status The status for the current row.
 */
export function useRegistryRowPermissionGuard(
    lifecycleStage: LifecycleStage,
    status: RegistryStatus): (_action: ButtonActionType) => boolean {
    const isPermitted = usePermissionGuard();
    // A method to check if action is allowed based on button action
    const isActionAllowed = (action: ButtonActionType) => {
        const policy: ButtonPolicy = BUTTON_POLICIES[action];

        // If the remaining policy checks do not have any items to enforce, no check is needed
        const isValidStage: boolean = policy.stage.length === 0 || policy.stage.includes(lifecycleStage);
        const isValidStatus: boolean = policy.status.length === 0 || policy.status.includes(status);

        return isPermitted(policy.permission) && isValidStage && isValidStatus;
    };

    return isActionAllowed;
}
