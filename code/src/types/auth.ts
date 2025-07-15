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
    registrySubmission: boolean;
    allTasks: boolean;
    invoice: boolean;
    sales: boolean;
    operation: boolean;
    viewTask: boolean;
    completeTask: boolean;
    reportTask: boolean;
    export: boolean;
};
