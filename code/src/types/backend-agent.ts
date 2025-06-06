export type CustomAgentResponseBody = {
  message: string;
  success?: boolean;
  iri?: string;
};

export type InternalApiIdentifier = "address" | "concept" | "contracts" | "contract_status" | "event" | "form" | "geocode_postal" | "geocode_address" | "geocode_city" | "geodecode" | "instances" | "schedule" | "tasks"