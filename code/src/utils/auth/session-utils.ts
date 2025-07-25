/**
 * Open full screen mode.
 */

import { Routes } from "io/config/routes";
import { HasPermissions, PermissionScheme } from "types/auth";

const hasPermitionsInitial: HasPermissions = {
  registry: false,
  registrySubmission: false,
  allTasks: false,
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
    hasPermissions: hasPermitionsInitial,
  };
  if (roles.length === 0) {
    return permissionScheme;
  }

  // Access to different registry depends on roles
  if (roles.includes("registry-navigation-pending")) {
    // Given access to registry submission
    permissionScheme.hasPermissions.registrySubmission = true;
  }
  if (roles.includes("registry-navigation")) {
    // Given access to all records in the registry
    permissionScheme.hasPermissions.registry = true;
    permissionScheme.hasPermissions.allTasks = true;
  } else if (roles.includes("registry-navigation-restricted")) {
    // Given access to only view outstanding tasks
    permissionScheme.hasPermissions.registry = true;
  }

  // Roles with access to only specific routes
  if (roles.includes("task-viewer")) {
    permissionScheme.registryPageLink = Routes.REGISTRY_TASK_DATE;
    permissionScheme.hasPermissions.completeTask = true;
    permissionScheme.hasPermissions.viewTask = true;
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
  return permissionScheme;
}
