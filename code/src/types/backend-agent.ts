import { EVENT_KEY } from "utils/constants";

export type AgentResponseBody = {
  apiVersion: string;
  data?: {
    id?: string;
    message?: string;
    deleted?: boolean;
    items?: string[] | Record<string, unknown>[];
  };
  error?: {
    code: number;
    message: string;
  };
};

export const InternalApiIdentifierMap = {
  ADDRESS: "address",
  ACTIVITY: "activity",
  BILL: "bill",
  CONCEPT: "concept",
  CONTRACTS: "contracts",
  CONTRACT_STATUS: "contract_status",
  COUNT: "count",
  EVENT: EVENT_KEY,
  FILTER: "filter",
  FORM: "form",
  GEOCODE_POSTAL: "geocode_postal",
  GEOCODE_ADDRESS: "geocode_address",
  GEOCODE_CITY: "geocode_city",
  GEODECODE: "geodecode",
  HISTORY: "history",
  INSTANCES: "instances",
  SCHEDULE: "schedule",
  TASKS: "tasks",
  OUTSTANDING: "outstanding",
  SCHEDULED: "scheduled",
  CLOSED: "closed",
} as const;
export type InternalApiIdentifier = typeof InternalApiIdentifierMap[keyof typeof InternalApiIdentifierMap];

export type UrlExistsResponse = {
  url: string;
  exists: boolean;
};