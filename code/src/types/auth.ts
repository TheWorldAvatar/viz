import { LifecycleStage, LifecycleStageMap, RegistryStatus, RegistryStatusMap } from "./form";

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
}

export const BUTTON_POLICIES: Record<string, ButtonPolicy> = {
    APPROVE_CONTRACT: {
        permission: "registryFullAccess",
        stage: [LifecycleStageMap.PENDING],
        status: [],
    },
    REVIEW_BILLABLES: {
        permission: "invoice",
        stage: [LifecycleStageMap.CLOSED],
        status: [RegistryStatusMap.COMPLETED, RegistryStatusMap.CANCELLED, RegistryStatusMap.REPORTED, RegistryStatusMap.BILLABLE_CANCELLED, RegistryStatusMap.BILLABLE_COMPLETED, RegistryStatusMap.BILLABLE_REPORTED],
    },
    VIEW_BILLABLES: {
        permission: "invoice",
        stage: [LifecycleStageMap.CLOSED, LifecycleStageMap.BILLABLE],
        status: [RegistryStatusMap.BILLABLE_CANCELLED, RegistryStatusMap.BILLABLE_COMPLETED, RegistryStatusMap.BILLABLE_REPORTED, RegistryStatusMap.INVOICED],
    },
    DELETE: {
        permission: "delete",
        stage: [LifecycleStageMap.PENDING, LifecycleStageMap.GENERAL, LifecycleStageMap.ACCOUNT, LifecycleStageMap.PRICING],
        status: [],
    },
    DRAFT_TEMPLATE: {
        permission: "draftTemplate",
        stage: [LifecycleStageMap.PENDING, LifecycleStageMap.ACTIVE, LifecycleStageMap.ARCHIVE, LifecycleStageMap.OUTSTANDING,
        LifecycleStageMap.SCHEDULED, LifecycleStageMap.CLOSED,],
        status: [],
    },
    EDIT: {
        permission: "edit",
        stage: [LifecycleStageMap.PENDING, LifecycleStageMap.GENERAL, LifecycleStageMap.ACCOUNT, LifecycleStageMap.PRICING],
        status: [],
    },
    RESUBMIT: {
        permission: "registryFullAccess",
        stage: [],
        status: [RegistryStatusMap.AMENDED],
    },
    TERMINATE_CONTRACT: {
        permission: "registryFullAccess",
        stage: [LifecycleStageMap.ACTIVE],
        status: [],
    },
    ASSIGN_TASK: {
        permission: "operation",
        stage: [LifecycleStageMap.OUTSTANDING, LifecycleStageMap.SCHEDULED, LifecycleStageMap.CLOSED],
        status: [RegistryStatusMap.NEW, RegistryStatusMap.ASSIGNED, RegistryStatusMap.COMPLETED],
    },
    CANCEL_OR_REPORT_TASK: {
        permission: "reportTask",
        stage: [LifecycleStageMap.OUTSTANDING, LifecycleStageMap.SCHEDULED],
        status: [RegistryStatusMap.NEW, RegistryStatusMap.ASSIGNED],
    },
    COMPLETE_TASK: {
        permission: "completeTask",
        stage: [LifecycleStageMap.OUTSTANDING, LifecycleStageMap.CLOSED],
        status: [RegistryStatusMap.ASSIGNED, RegistryStatusMap.COMPLETED],
    },
    RESCHEDULE_TASK: {
        permission: "rescheduleTask",
        stage: [LifecycleStageMap.OUTSTANDING, LifecycleStageMap.SCHEDULED],
        status: [],
    },
} as const;

export type ButtonActionType = keyof typeof BUTTON_POLICIES;