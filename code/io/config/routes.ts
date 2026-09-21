import { SupportedLanguage } from "@/types/dictionary";

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

// These routes should be used as the keys for the getRoute method to prepend asset prefix and lang
export const Routes = {
  // Home route should be used directly over the getRoute method
  HOME: `${ASSET_PREFIX}/`,
  MAP: "MAP",
  DASHBOARD: "DASHBOARD",
  REGISTRY: "REGISTRY",
  BILLING_ACCOUNTS: "BILLING_ACCOUNTS",
  BILLING_PRICING_MODELS: "BILLING_PRICING_MODELS",
  BILLING_ACTIVITY_PRICE: "BILLING_ACTIVITY_PRICE",
  BILLING_ACTIVITY_TRANSACTION: "BILLING_ACTIVITY_TRANSACTION",
  BILLING_INVOICE: "BILLING_INVOICE",
  REGISTRY_TASK: "REGISTRY_TASK",
  REGISTRY_GENERAL: "REGISTRY_GENERAL",
  REGISTRY_TASK_OUTSTANDING: "REGISTRY_TASK_OUTSTANDING",
  REGISTRY_TASK_OUTSTANDING_MOBILE: "REGISTRY_TASK_OUTSTANDING_MOBILE",
  REGISTRY_TASK_SCHEDULED: "REGISTRY_TASK_SCHEDULED",
  REGISTRY_TASK_CLOSED: "REGISTRY_TASK_CLOSED",
  REGISTRY_TASK_PLANNER: "REGISTRY_TASK_PLANNER",
  REGISTRY_REPORT: "REGISTRY_REPORT",
  REGISTRY_ADD: "REGISTRY_ADD",
  REGISTRY_ADJUST_PRICING: "REGISTRY_ADJUST_PRICING",
  REGISTRY_EDIT: "REGISTRY_EDIT",
  REGISTRY_DELETE: "REGISTRY_DELETE",
  REGISTRY_TERMINATE: "REGISTRY_TERMINATE",
  REGISTRY_TASK_RESCHEDULE: "REGISTRY_TASK_RESCHEDULE",
  HELP: "HELP",
};

export type RouteKey = (typeof Routes)[keyof typeof Routes];

// Default available path names
export const Paths: Record<RouteKey, string> = {
  [Routes.HOME]: ASSET_PREFIX,
  [Routes.MAP]: "map",
  [Routes.DASHBOARD]: "analytics",
  [Routes.REGISTRY]: "view",
  [Routes.BILLING_ACCOUNTS]: "billing/account",
  [Routes.BILLING_PRICING_MODELS]: "billing/pricing",
  [Routes.BILLING_ACTIVITY_PRICE]: "billing/activity/price",
  [Routes.BILLING_ACTIVITY_TRANSACTION]: "billing/activity/transaction",
  [Routes.BILLING_INVOICE]: "billing/invoice",
  [Routes.REGISTRY_TASK_OUTSTANDING]: `${REGISTRY_TASK}/outstanding`,
  [Routes.REGISTRY_TASK_OUTSTANDING_MOBILE]: REGISTRY_TASK,
  [Routes.REGISTRY_TASK_SCHEDULED]: `${REGISTRY_TASK}/scheduled`,
  [Routes.REGISTRY_TASK_CLOSED]: `${REGISTRY_TASK}/closed`,
  [Routes.REGISTRY_TASK_PLANNER]: `${REGISTRY_TASK}/planner`,
  [Routes.REGISTRY_TASK_CLOSED]: `${REGISTRY_TASK}/closed`,
  [Routes.REGISTRY_GENERAL]: REGISTRY_GENERAL,
  [Routes.REGISTRY_TASK]: REGISTRY_TASK,
  [Routes.REGISTRY_REPORT]: `${REGISTRY_GENERAL}/report`,
  [Routes.REGISTRY_ADD]: "add",
  [Routes.REGISTRY_ADJUST_PRICING]: `${REGISTRY_GENERAL}/pricing`,
  [Routes.REGISTRY_EDIT]: "edit",
  [Routes.REGISTRY_DELETE]: "delete",
  [Routes.REGISTRY_TERMINATE]: "terminate",
  [Routes.REGISTRY_TASK_RESCHEDULE]: `${REGISTRY_TASK}/reschedule`,
  [Routes.HELP]: "help",
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

/**
 * Constructs the route format compatible with next.js syntax.
 *
 * @param lang The language tag associated with the paths.
 * @param route A key to retrieve the corresponding paths.
 */
export function getRoute(lang: SupportedLanguage, route: RouteKey): string {
  return `${ASSET_PREFIX}/${lang}/${Paths[route]}`;
};
