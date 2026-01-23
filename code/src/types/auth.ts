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

/**
 * A HasPermissions object containing user permissions to view and interact with certain components.
 */
export type HasPermissions = {
    registry: boolean;
    pendingRegistry: boolean;
    allTasks: boolean;
    invoice: boolean;
    sales: boolean;
    operation: boolean;
    draftTemplate: boolean;
    viewTask: boolean;
    completeTask: boolean;
    completeAndDuplicateTask: boolean;
    reportTask: boolean;
    saveTask: boolean;
    export: boolean;
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
        permission: "operation",
        stage: [LifecycleStageMap.PENDING],
        status: [],
        billingStatus: [],
    },
    BILL_PAYMENT: {
        permission: "sales",
        stage: [LifecycleStageMap.ACTIVITY],
        status: [],
        billingStatus: [BillingStatusMap.READY],
    },
    BILL_PENDING: {
        permission: "sales",
        stage: [LifecycleStageMap.ACTIVITY],
        status: [],
        billingStatus: [BillingStatusMap.PENDING_APPROVAL],
    },
    DELETE: {
        permission: "sales",
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
        permission: "sales",
        stage: [LifecycleStageMap.PENDING, LifecycleStageMap.GENERAL, LifecycleStageMap.ACCOUNT, LifecycleStageMap.PRICING],
        status: [],
        billingStatus: [],
    },
    RESUBMIT: {
        permission: "sales",
        stage: [],
        status: [RegistryStatusMap.AMENDED],
        billingStatus: [],
    },
    TERMINATE_CONTRACT: {
        permission: "operation",
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
    CANCEL_TASK: {
        permission: "operation",
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
    REPORT_TASK: {
        permission: "reportTask",
        stage: [LifecycleStageMap.OUTSTANDING, LifecycleStageMap.SCHEDULED],
        status: [RegistryStatusMap.NEW, RegistryStatusMap.ASSIGNED],
        billingStatus: [],
    },
    RESCHEDULE_TASK: {
        permission: "operation",
        stage: [LifecycleStageMap.OUTSTANDING, LifecycleStageMap.SCHEDULED],
        status: [],
        billingStatus: [],
    },
} as const;

export type ButtonActionType = keyof typeof BUTTON_POLICIES;