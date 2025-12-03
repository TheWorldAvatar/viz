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

const REGISTRY_GENERAL: string = "registry";
const REGISTRY_TASK: string = `${REGISTRY_GENERAL}/task`;

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
  REGISTRY_TASK_OUTSTANDING: `${REGISTRY_TASK}/outstanding`,
  REGISTRY_TASK_SCHEDULED: `${REGISTRY_TASK}/scheduled`,
  REGISTRY_TASK_CLOSED: `${REGISTRY_TASK}/closed`,
  REGISTRY_REPORT: `${REGISTRY_GENERAL}/report`,
  REGISTRY_ADD: "add",
  REGISTRY_EDIT: "edit",
  REGISTRY_DELETE: "delete",
  REGISTRY_TASK_DISPATCH: `${REGISTRY_TASK}/dispatch`,
  REGISTRY_TASK_COMPLETE: `${REGISTRY_TASK}/complete`,
  REGISTRY_TASK_CANCEL: `${REGISTRY_TASK}/cancel`,
  REGISTRY_TASK_REPORT: `${REGISTRY_TASK}/report`,
  REGISTRY_TASK_VIEW: `${REGISTRY_TASK}/view`,
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
  REGISTRY_TASK: `${ASSET_PREFIX}/${REGISTRY_TASK}`,
  REGISTRY_GENERAL: `${ASSET_PREFIX}/${REGISTRY_GENERAL}`,
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
  BILLING: "Billing",
  HELP: "Help",
};
