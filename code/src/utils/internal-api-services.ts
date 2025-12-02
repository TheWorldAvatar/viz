import { AgentResponseBody, InternalApiIdentifier } from "types/backend-agent";
import { parseStringsForUrls } from "./client-utils";

const assetPrefix = process.env.ASSET_PREFIX ?? "";
const prefixedRegistryURL: string = `${assetPrefix}/api/registry/`;
export const BRANCH_ADD = "branch_add";
export const BRANCH_DELETE = "branch_delete";

export function makeInternalRegistryAPIwithParams(
  internalIdentifier: InternalApiIdentifier,
  ...params: string[]
): string {
  let searchParams: URLSearchParams;
  switch (internalIdentifier) {
    case "address":
      searchParams = new URLSearchParams({
        postal_code: params[0],
      });
      break;
    case "concept":
      searchParams = new URLSearchParams({
        uri: params[0],
      });
      break;
    case "contracts":
      searchParams = new URLSearchParams({
        stage: params[0],
        type: params[1],
        page: params[2],
        limit: params[3],
        sort_by: params[4],
        filters: params[5],
      });
      break;
    case "contract_status":
      searchParams = new URLSearchParams({
        id: params[0],
      });
      break;
    case "count":
      searchParams = new URLSearchParams({
        type: params[0],
        filters: params[1] ?? "",
        lifecycle: params[2] ?? null,
        start_date: params[3] ?? null,
        end_date: params[4] ?? null,
      });
      break;
    case "instances":
      searchParams = new URLSearchParams({
        type: params[0],
        label: params[1] ?? null,
        identifier: params[2] ?? null,
        subtype: params[3] ?? null,
        page: params[4] ?? null,
        limit: params[5] ?? null,
        sort_by: params[6] ?? null,
        filters: params[7] ?? "",
        branch_delete: params[8] ?? null,
      });
      break;
    case "event":
      searchParams = new URLSearchParams({
        stage: params[0],
        type: params[1],
        identifier: params[2] ?? null,
      });
      break;
    case "filter":
      searchParams = new URLSearchParams({
        type: params[0],
        field: params[1],
        search: params[2] ?? null,
        filters: params[3] ?? "",
        lifecycle: params[4] ?? null,
        start_date: params[5] ?? null,
        end_date: params[6] ?? null,
      });
      break;
    case "form":
      searchParams = new URLSearchParams({
        type: parseStringsForUrls(params[0]),
        identifier: params[1] ?? null,
      });
      break;
    case "geocode_address":
      searchParams = new URLSearchParams({
        block: params[0] ?? null,
        street: params[1] ?? null,
      });
      break;
    case "geocode_postal":
      searchParams = new URLSearchParams({
        postalCode: params[0] ?? null,
      });
      break;
    case "geocode_city":
      searchParams = new URLSearchParams({
        city: params[0] ?? null,
        country: params[1] ?? null,
      });
      break;
    case "geodecode":
      searchParams = new URLSearchParams({
        iri: params[0],
      });
      break;
    case "schedule":
      searchParams = new URLSearchParams({
        id: params[0],
      });
      break;
    case "tasks":
      searchParams = new URLSearchParams({
        type: params[0],
        idOrTimestamp: params[1],
        filters: params[2],
      });
      break;
    case "outstanding":
      searchParams = new URLSearchParams({
        type: params[0],
        page: params[1],
        limit: params[2],
        sort_by: params[3],
        filters: params[4],
      });
      break;
    case "scheduled":
    case "closed":
      searchParams = new URLSearchParams({
        type: params[0],
        start_date: params[1],
        end_date: params[2],
        page: params[3],
        limit: params[4],
        sort_by: params[5],
        filters: params[6],
      });
      break;
  }
  return `${prefixedRegistryURL}${internalIdentifier}?${searchParams.toString()}`;
}

export async function queryInternalApi(url: string): Promise<AgentResponseBody> {
  const activeRes = await fetch(url,
    { cache: "no-store", credentials: "same-origin" }
  );
  return await activeRes.json();
}