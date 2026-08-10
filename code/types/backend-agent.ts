import { EVENT_KEY } from "@/utils/constants";
import { SparqlResponseField } from "./form";
import { FileEntry } from "./settings";

export type AgentResponseBody = {
  apiVersion: string;
  data?: AgentResponseDataPayload;
  error?: {
    code: number;
    message: string;
  };
};

export type AgentResponseDataPayload = {
  id?: string;
  message?: string;
  currentItemCount?: number;
  totalItems?: number;
  columns?: ColumnDefinitionResponse[];
  deleted?: boolean;
  items?: string[] | Record<string, unknown>[];
};

export type ColumnDefinitionResponse = {
  value: string;
  type: "literal" | "uri" | "array";
  datatype: string;
  stage?: string;
};


export type FileResponse = {
  blob: Blob;
  file: string;
};

export type HistoryDetails = {
  message: SparqlResponseField;
  timestamp: SparqlResponseField;
  user: SparqlResponseField;
};

export const InternalApiIdentifierMap = {
  ACCOUNT: "account",
  ADDRESS: "address",
  BILL: "bill",
  CONCEPT: "concept",
  CONTRACTS: "contracts",
  CONTRACT_STATUS: "contract_status",
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
  INVOICEABLE: "invoice",
} as const;
export type InternalApiIdentifier = typeof InternalApiIdentifierMap[keyof typeof InternalApiIdentifierMap];

export type ContractDirectory = {
  url: string;
  files: FileEntry[];
};