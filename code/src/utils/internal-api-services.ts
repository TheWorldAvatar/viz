import { HTTP_METHOD } from "next/dist/server/web/http";
import { AgentResponseBody, InternalApiIdentifier, InternalApiIdentifierMap, UrlExistsResponse } from "types/backend-agent";
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
    case InternalApiIdentifierMap.ADDRESS:
      searchParams = new URLSearchParams({
        postal_code: params[0],
      });
      break;
    case InternalApiIdentifierMap.BILL:
      searchParams = new URLSearchParams({
        type: params[0],
        id: params[1] ?? null,
      });
      break;
    case InternalApiIdentifierMap.CONCEPT:
      searchParams = new URLSearchParams({
        uri: params[0],
      });
      break;
    case InternalApiIdentifierMap.CONTRACTS:
      searchParams = new URLSearchParams({
        stage: params[0],
        type: params[1],
        page: params[2],
        limit: params[3],
        sort_by: params[4],
        filters: params[5],
      });
      break;
    case InternalApiIdentifierMap.CONTRACT_STATUS:
      searchParams = new URLSearchParams({
        id: params[0],
      });
      break;
    case InternalApiIdentifierMap.COUNT:
      searchParams = new URLSearchParams({
        type: params[0],
        filters: params[1] ?? "",
        lifecycle: params[2] ?? null,
        start_date: params[3] ?? null,
        end_date: params[4] ?? null,
      });
      break;
    case InternalApiIdentifierMap.INSTANCES:
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
    case InternalApiIdentifierMap.EVENT:
      searchParams = new URLSearchParams({
        stage: params[0],
        type: params[1],
        identifier: params[2] ?? null,
      });
      break;
    case InternalApiIdentifierMap.FILTER:
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
    case InternalApiIdentifierMap.FORM:
      searchParams = new URLSearchParams({
        type: parseStringsForUrls(params[0]),
        identifier: params[1] ?? null,
      });
      break;
    case InternalApiIdentifierMap.GEOCODE_ADDRESS:
      searchParams = new URLSearchParams({
        block: params[0] ?? null,
        street: params[1] ?? null,
      });
      break;
    case InternalApiIdentifierMap.GEOCODE_POSTAL:
      searchParams = new URLSearchParams({
        postalCode: params[0] ?? null,
      });
      break;
    case InternalApiIdentifierMap.GEOCODE_CITY:
      searchParams = new URLSearchParams({
        city: params[0] ?? null,
        country: params[1] ?? null,
      });
      break;
    case InternalApiIdentifierMap.GEODECODE:
      searchParams = new URLSearchParams({
        iri: params[0],
      });
      break;
    case InternalApiIdentifierMap.SCHEDULE:
      searchParams = new URLSearchParams({
        id: params[0],
      });
      break;
    case InternalApiIdentifierMap.TASKS:
      searchParams = new URLSearchParams({
        type: params[0] ?? null,
        idOrTimestamp: params[1] ?? null,
        filters: params[2] ?? null,
      });
      break;
    case InternalApiIdentifierMap.OUTSTANDING:
      searchParams = new URLSearchParams({
        type: params[0],
        page: params[1],
        limit: params[2],
        sort_by: params[3],
        filters: params[4],
      });
      break;
    case InternalApiIdentifierMap.ACTIVITY:
    case InternalApiIdentifierMap.SCHEDULED:
    case InternalApiIdentifierMap.CLOSED:
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

export async function queryInternalApi(url: string, method?: Omit<HTTP_METHOD, "HEAD" | "OPTIONS" | "PATCH">, body?: string): Promise<AgentResponseBody> {
  let requestParams: RequestInit = { cache: "no-store", credentials: "same-origin" };
  if (method == "DELETE") {
    requestParams = {
      ...requestParams,
      method: method.toString(),
      headers: { "Content-Type": "application/json" },
    };
  } else if (method == "PUT" || method == "POST") {
    requestParams = {
      ...requestParams,
      method: method.toString(),
      headers: { "Content-Type": "application/json" },
      body: body,
    };
  }
  const res = await fetch(url, requestParams);
  return await res.json();
}

export async function queryRegistryAttachmentAPI(contract: string): Promise<UrlExistsResponse> {
  const url: string = `${prefixedRegistryURL}attachment/${contract}`
  const requestParams: RequestInit = { cache: "no-store", credentials: "same-origin" };
  const res = await fetch(url, requestParams);
  return await res.json();
}

/**
 * Safely derive an URL that can be used in href.
 * Returns null if the URL is invalid or uses an unsafe protocol.
 */
export function getSafeUrl(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== "string") {
    return null;
  }

  try {
    const url: URL = new URL(rawUrl);
    const protocol: string = url.protocol.toLowerCase();
    if (protocol !== "http:" && protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}