const ASSET_PREFIX = process.env.ASSET_PREFIX ?? "";

export const Modules: {
  [key: string]: string;
} = {
  MAP: "map",
  DASHBOARD: "dashboard",
  REGISTRY: "registry",
  BILLING: "billing",
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
  BILLING_ACCOUNTS: "billing/account",
  BILLING_PRICING_MODELS: "billing/pricing",
  BILLING_ACTIVITY: "billing/activity",
  REGISTRY_GENERAL: "registry",
  REGISTRY_TASK_OUTSTANDING: "registry/task/outstanding",
  REGISTRY_TASK_SCHEDULED: "registry/task/scheduled",
  REGISTRY_TASK_CLOSED: "registry/task/closed",
  REGISTRY_REPORT: "registry/report",
  REGISTRY_ADD: "add",
  REGISTRY_EDIT: "edit",
  REGISTRY_DELETE: "delete",
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
  BILLING_ACCOUNTS: `${ASSET_PREFIX}/${Paths.BILLING_ACCOUNTS}`,
  BILLING_PRICING_MODELS: `${ASSET_PREFIX}/${Paths.BILLING_PRICING_MODELS}`,
  BILLING_ACTIVITY: `${ASSET_PREFIX}/${Paths.BILLING_ACTIVITY}`,
  REGISTRY_GENERAL: `${ASSET_PREFIX}/${Paths.REGISTRY_GENERAL}`,
  REGISTRY_TASK_OUTSTANDING: `${ASSET_PREFIX}/${Paths.REGISTRY_TASK_OUTSTANDING}`,
  REGISTRY_TASK_SCHEDULED: `${ASSET_PREFIX}/${Paths.REGISTRY_TASK_SCHEDULED}`,
  REGISTRY_TASK_CLOSED: `${ASSET_PREFIX}/${Paths.REGISTRY_TASK_CLOSED}`,
  REGISTRY_REPORT: `${ASSET_PREFIX}/${Paths.REGISTRY_REPORT}`,
  REGISTRY_ADD: `${ASSET_PREFIX}/${Paths.REGISTRY_ADD}`,
  REGISTRY_EDIT: `${ASSET_PREFIX}/${Paths.REGISTRY_EDIT}`,
  REGISTRY_DELETE: `${ASSET_PREFIX}/${Paths.REGISTRY_DELETE}`,
  HELP: `${ASSET_PREFIX}/${Paths.HELP}`,
};

export const PageTitles: {
  [key: string]: string;
} = {
  MAP: "Explore",
  DASHBOARD: "Analytics",
  REGISTRY: "Registry",
  BILLING: "Billing",
  HELP: "Help",
};
