/**
 * Open full screen mode.
 */

import { Routes } from "io/config/routes";
import { PermissionScheme } from "types/auth";

export function parsePermissions(roles: string[]): PermissionScheme {
    const permissionScheme: PermissionScheme = {
        route: null,
        pendingRegistry: false,
        activeArchiveRegistry: false,
        export: false,
        invoice: false,
        sales: false,
        operation: false,
        viewTask: false,
        completeTask: false,
        reportTask: false,
    }
    if (roles.length === 0) {
        return permissionScheme;
    }

    // Access to different registry depends on roles
    if (roles.includes("registry-navigation")) {
        permissionScheme.pendingRegistry = true;
        permissionScheme.activeArchiveRegistry = true;
    } else if (roles.includes("registry-navigation-pending")) {
        // Users with only access to the pending registry cannot access other registries
        permissionScheme.route = Routes.REGISTRY_PENDING;
    } else if (roles.includes("registry-navigation-active-archive")) {
        // Users with only access to the active and archive registry cannot access the pending registry
        // and will be redirected
        permissionScheme.route = Routes.REGISTRY_ACTIVE;
        permissionScheme.activeArchiveRegistry = true;
    }

    // Roles with access to only specific routes
    if (roles.includes("task-viewer")) {
        permissionScheme.route = Routes.REGISTRY_TASK_DATE;
        permissionScheme.completeTask = true;
        permissionScheme.reportTask = true;
    }
    if (roles.includes("finance")) {
        permissionScheme.route = Routes.REGISTRY_ACTIVE;
        permissionScheme.invoice = true;
    }

    // General permissions
    if (roles.includes("sales")) {
        permissionScheme.sales = true;
    }
    if (roles.includes("operations")) {
        permissionScheme.operation = true;
        permissionScheme.viewTask = true;
        permissionScheme.completeTask = true;
        permissionScheme.reportTask = true;
    }
    if (roles.includes("export")) {
        permissionScheme.export = true;
    }
    return permissionScheme
}
