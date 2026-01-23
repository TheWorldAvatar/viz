"use client"

import { BUTTON_POLICIES, ButtonActionType, ButtonPolicy } from 'types/auth';
import { BillingStatus, LifecycleStage, RegistryStatus } from 'types/form';
import { usePermissionGuard } from './usePermissionGuard';

/**
 * A custom hook to support authorisation checks to render components for a registry row.
 * 
 * @param {LifecycleStage} lifecycleStage The current stage of a contract lifecycle to display.
 * @param {RegistryStatus} status The status for the current row.
 * @param {BillingStatus} billingStatus The status for the current row's billing mode.
 */
export function useRegistryRowPermissionGuard(
    lifecycleStage: LifecycleStage,
    status: RegistryStatus,
    billingStatus: BillingStatus): (_action: ButtonActionType) => boolean {
    const isPermitted = usePermissionGuard();
    // A method to check if action is allowed based on button action
    const isActionAllowed = (action: ButtonActionType) => {
        const policy: ButtonPolicy = BUTTON_POLICIES[action];

        // If the remaining policy checks do not have any items to enforce, no check is needed
        const isValidStage: boolean = policy.stage.length === 0 || policy.stage.includes(lifecycleStage);
        const isValidStatus: boolean = policy.status.length === 0 || policy.status.includes(status);
        const isValidBillingStatus: boolean = policy.billingStatus.length === 0 || policy.billingStatus.includes(billingStatus);

        return isPermitted(policy.permission) && isValidStage && isValidStatus && isValidBillingStatus;
    };

    return isActionAllowed;
}
