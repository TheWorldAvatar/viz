const ASSET_PREFIX = process.env.ASSET_PREFIX ?? "";

export const Modules: {
  [key: string]: string;
} = {
  MAP: "map",
  DASHBOARD: "dashboard",
  REGISTRY: "registry",
  HELP: "help",
};

export const Apis: {
  [key: string]: string;
} = {
  MAP_SETTINGS: `${ASSET_PREFIX}/api/map/settings`,
};

// Default available path names
export const Paths: {
  [key: string]: string;
} = {
  HOME: "",
  MAP: "map",
  DASHBOARD: "analytics",
  REGISTRY: "view",
  REGISTRY_TASK: "registry/task",
  REGISTRY_GENERAL: "registry",
  REGISTRY_TASK_OUTSTANDING: "registry/task/outstanding",
  REGISTRY_TASK_SCHEDULED: "registry/task/scheduled",
  REGISTRY_TASK_CLOSED: "registry/task/closed",
  REGISTRY_REPORT: "registry/report",
  REGISTRY_ADD: "add",
  REGISTRY_EDIT: "edit",
  REGISTRY_DELETE: "delete",
  REGISTRY_TASK_DISPATCH: "registry/task/dispatch",
  REGISTRY_TASK_COMPLETE: "registry/task/complete",
  REGISTRY_TASK_CANCEL: "registry/task/cancel",
  REGISTRY_TASK_REPORT: "registry/task/report",
  REGISTRY_TASK_VIEW: "registry/task/view",
  HELP: "help",
};

// Routes with ASSET_PREFIX appended to the path names
export const Routes: {
  [key: string]: string;
} = {
  HOME: `${ASSET_PREFIX}/${Paths.HOME}`,
  MAP: `${ASSET_PREFIX}/${Paths.MAP}`,
  DASHBOARD: `${ASSET_PREFIX}/${Paths.DASHBOARD}`,
  REGISTRY: `${ASSET_PREFIX}/${Paths.REGISTRY}`,
  REGISTRY_TASK: `${ASSET_PREFIX}/${Paths.REGISTRY_TASK}`,
  REGISTRY_GENERAL: `${ASSET_PREFIX}/${Paths.REGISTRY_GENERAL}`,
  REGISTRY_TASK_OUTSTANDING: `${ASSET_PREFIX}/${Paths.REGISTRY_TASK_OUTSTANDING}`,
  REGISTRY_TASK_SCHEDULED: `${ASSET_PREFIX}/${Paths.REGISTRY_TASK_SCHEDULED}`,
  REGISTRY_TASK_CLOSED: `${ASSET_PREFIX}/${Paths.REGISTRY_TASK_CLOSED}`,
  REGISTRY_REPORT: `${ASSET_PREFIX}/${Paths.REGISTRY_REPORT}`,
  REGISTRY_ADD: `${ASSET_PREFIX}/${Paths.REGISTRY_ADD}`,
  REGISTRY_EDIT: `${ASSET_PREFIX}/${Paths.REGISTRY_EDIT}`,
  REGISTRY_DELETE: `${ASSET_PREFIX}/${Paths.REGISTRY_DELETE}`,
  REGISTRY_TASK_DISPATCH: `${ASSET_PREFIX}/${Paths.REGISTRY_TASK_DISPATCH}`,
  REGISTRY_TASK_COMPLETE: `${ASSET_PREFIX}/${Paths.REGISTRY_TASK_COMPLETE}`,
  REGISTRY_TASK_CANCEL: `${ASSET_PREFIX}/${Paths.REGISTRY_TASK_CANCEL}`,
  REGISTRY_TASK_REPORT: `${ASSET_PREFIX}/${Paths.REGISTRY_TASK_REPORT}`,
  REGISTRY_TASK_VIEW: `${ASSET_PREFIX}/${Paths.REGISTRY_TASK_VIEW}`,
  HELP: `${ASSET_PREFIX}/${Paths.HELP}`,
};

export const PageTitles: {
  [key: string]: string;
} = {
  MAP: "Explore",
  DASHBOARD: "Analytics",
  REGISTRY: "Registry",
  HELP: "Help",
};
