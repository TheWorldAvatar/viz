/**
 * Open full screen mode.
 */

import { Routes } from "io/config/routes";
import { HasPermissions, PermissionScheme } from "types/auth";

const hasPermitionsInitial: HasPermissions = {
    pendingRegistry: false,
    activeArchiveRegistry: false,
    invoice: false,
    sales: false,
    operation: false,
    viewTask: false,
    completeTask: false,
    reportTask: false,
    export: false,
};

export function parsePermissions(roles: string[]): PermissionScheme {
    const permissionScheme: PermissionScheme = {
        registryPageLink: null,
        hasPermissions: hasPermitionsInitial
    }
    if (roles.length === 0) {
        return permissionScheme;
    }

    // Access to different registry depends on roles
    if (roles.includes("registry-navigation")) {
        permissionScheme.hasPermissions.pendingRegistry = true;
        permissionScheme.hasPermissions.activeArchiveRegistry = true;
    } else if (roles.includes("registry-navigation-pending")) {
        // Users with only access to the pending registry cannot access other registries
        permissionScheme.registryPageLink = Routes.REGISTRY_PENDING;
    } else if (roles.includes("registry-navigation-active-archive")) {
        // Users with only access to the active and archive registry cannot access the pending registry
        // and will be redirected
        permissionScheme.registryPageLink = Routes.REGISTRY_ACTIVE;
        permissionScheme.hasPermissions.activeArchiveRegistry = true;
    }

    // Roles with access to only specific routes
    if (roles.includes("task-viewer")) {
        permissionScheme.registryPageLink = Routes.REGISTRY_TASK_DATE;
        permissionScheme.hasPermissions.completeTask = true;
        permissionScheme.hasPermissions.reportTask = true;
    }
    if (roles.includes("finance")) {
        permissionScheme.registryPageLink = Routes.REGISTRY_ACTIVE;
        permissionScheme.hasPermissions.invoice = true;
    }

    // General permissions
    if (roles.includes("sales")) {
        permissionScheme.hasPermissions.sales = true;
    }
    if (roles.includes("operations")) {
        permissionScheme.hasPermissions.operation = true;
        permissionScheme.hasPermissions.viewTask = true;
        permissionScheme.hasPermissions.completeTask = true;
        permissionScheme.hasPermissions.reportTask = true;
    }
    if (roles.includes("export")) {
        permissionScheme.hasPermissions.export = true;
    }
    return permissionScheme
}
