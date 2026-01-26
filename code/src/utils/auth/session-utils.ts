/**
 * Open full screen mode.
 */

import { Routes } from "io/config/routes";
import { HasPermissions, PermissionScheme } from "types/auth";

const hasPermitionsInitial: HasPermissions = {
  registryFullAccess: true,
  completeTask: false,
  completeAndDuplicateTask: false,
  delete: false,
  draftTemplate: false,
  edit: false,
  export: false,
  invoice: false,
  operation: false,
  reportTask: false,
  rescheduleTask: false,
  saveTask: false,
};

export function parsePermissions(roles: string[]): PermissionScheme {
  const permissionScheme: PermissionScheme = {
    registryPageLink: null,
    hasPermissions: hasPermitionsInitial,
  };
  if (roles.length === 0) {
    return permissionScheme;
  }

  // Roles with access to only specific routes
  if (roles.includes("task-viewer")) {
    permissionScheme.registryPageLink = Routes.REGISTRY_TASK_OUTSTANDING;
    permissionScheme.hasPermissions.registryFullAccess = false;
  }
  if (roles.includes("operations")) {
    permissionScheme.hasPermissions.operation = true;
  }
  if (roles.includes("finance")) {
    permissionScheme.hasPermissions.invoice = true;
  }

  // General permissions
  if (roles.includes("complete")) {
    permissionScheme.hasPermissions.completeTask = true;
  }
  if (roles.includes("delete")) {
    permissionScheme.hasPermissions.delete = true;
  }
  if (roles.includes("draft-template")) {
    permissionScheme.hasPermissions.draftTemplate = true;
  }
  if (roles.includes("duplicate-complete")) {
    permissionScheme.hasPermissions.completeAndDuplicateTask = true;
  }
  if (roles.includes("edit")) {
    permissionScheme.hasPermissions.edit = true;
  }
  if (roles.includes("export")) {
    permissionScheme.hasPermissions.export = true;
  }
  if (roles.includes("report")) {
    permissionScheme.hasPermissions.reportTask = true;
  }
  if (roles.includes("reschedule")) {
    permissionScheme.hasPermissions.rescheduleTask = true;
  }
  if (roles.includes("save")) {
    permissionScheme.hasPermissions.saveTask = true;
  }
  return permissionScheme;
}
