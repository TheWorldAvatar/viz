import { LifecycleStage, LifecycleStageMap, RegistryStatusMap, RegistryStatus, BillingStatus, BillingStatusMap } from "./form";

/**
 * Information retaining to keycloak login - username and relevant permissions.
 *
*/
export type SessionInfo = {
    userDisplayName: string;
    permissionScheme?: PermissionScheme;
};

/**
 * A default route in the registry page to be linked to from the landing page. And a HasPermissions object containing user permissions to view and interact with certain components.
 *
 */
export type PermissionScheme = {
    registryPageLink: string;
    hasPermissions: HasPermissions;
}

export type HasPermissions = {
    registryFullAccess: boolean;
    completeTask: boolean;
    completeAndDuplicateTask: boolean;
    delete: boolean;
    draftTemplate: boolean;
    edit: boolean;
    export: boolean;
    invoice: boolean;
    operation: boolean;
    reportTask: boolean;
    rescheduleTask: boolean;
    saveTask: boolean;
};

export type PermissionType = keyof HasPermissions;

export interface ButtonPolicy {
    permission: PermissionType,
    stage: LifecycleStage[],
    status: RegistryStatus[];
    billingStatus: BillingStatus[];
}

export const BUTTON_POLICIES: Record<string, ButtonPolicy> = {
    APPROVE_CONTRACT: {
        permission: "registryFullAccess",
        stage: [LifecycleStageMap.PENDING],
        status: [],
        billingStatus: [],
    },
    BILL_PAYMENT: {
        permission: "invoice",
        stage: [LifecycleStageMap.ACTIVITY],
        status: [],
        billingStatus: [BillingStatusMap.READY],
    },
    BILL_PENDING: {
        permission: "invoice",
        stage: [LifecycleStageMap.ACTIVITY],
        status: [],
        billingStatus: [BillingStatusMap.PENDING_APPROVAL],
    },
    DELETE: {
        permission: "delete",
        stage: [LifecycleStageMap.PENDING, LifecycleStageMap.GENERAL, LifecycleStageMap.ACCOUNT, LifecycleStageMap.PRICING],
        status: [],
        billingStatus: [],
    },
    DRAFT_TEMPLATE: {
        permission: "draftTemplate",
        stage: [LifecycleStageMap.PENDING, LifecycleStageMap.ACTIVE, LifecycleStageMap.ARCHIVE, LifecycleStageMap.OUTSTANDING,
        LifecycleStageMap.SCHEDULED, LifecycleStageMap.CLOSED,],
        status: [],
        billingStatus: [],
    },
    EDIT: {
        permission: "edit",
        stage: [LifecycleStageMap.PENDING, LifecycleStageMap.GENERAL, LifecycleStageMap.ACCOUNT, LifecycleStageMap.PRICING],
        status: [],
        billingStatus: [],
    },
    RESUBMIT: {
        permission: "registryFullAccess",
        stage: [],
        status: [RegistryStatusMap.AMENDED],
        billingStatus: [],
    },
    TERMINATE_CONTRACT: {
        permission: "registryFullAccess",
        stage: [LifecycleStageMap.ACTIVE],
        status: [],
        billingStatus: [],
    },
    ASSIGN_TASK: {
        permission: "operation",
        stage: [LifecycleStageMap.OUTSTANDING, LifecycleStageMap.SCHEDULED, LifecycleStageMap.CLOSED],
        status: [RegistryStatusMap.NEW, RegistryStatusMap.ASSIGNED, RegistryStatusMap.COMPLETED],
        billingStatus: [],
    },
    CANCEL_OR_REPORT_TASK: {
        permission: "reportTask",
        stage: [LifecycleStageMap.OUTSTANDING, LifecycleStageMap.SCHEDULED],
        status: [RegistryStatusMap.NEW, RegistryStatusMap.ASSIGNED],
        billingStatus: [],
    },
    COMPLETE_TASK: {
        permission: "completeTask",
        stage: [LifecycleStageMap.OUTSTANDING, LifecycleStageMap.CLOSED],
        status: [RegistryStatusMap.ASSIGNED, RegistryStatusMap.COMPLETED],
        billingStatus: [],
    },
    RESCHEDULE_TASK: {
        permission: "rescheduleTask",
        stage: [LifecycleStageMap.OUTSTANDING, LifecycleStageMap.SCHEDULED],
        status: [],
        billingStatus: [],
    },
} as const;

export type ButtonActionType = keyof typeof BUTTON_POLICIES;