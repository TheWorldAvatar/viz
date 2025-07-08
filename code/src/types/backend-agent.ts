export type AgentResponseBody = {
  apiVersion: string;
  data?: {
    id?: string;
    message?: string;
    deleted?: boolean;
    items?: string[] | Record<string, unknown>[];
  };
  error?: {
    code: number
    message: string;
  };
};

export type InternalApiIdentifier = "address" | "concept" | "contracts" | "contract_status" | "event" | "form" | "geocode_postal" | "geocode_address" | "geocode_city" | "geodecode" | "instances" | "schedule" | "tasks"