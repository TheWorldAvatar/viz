import { InternalApiIdentifier } from "types/backend-agent";
import { parseStringsForUrls } from "./client-utils";

const assetPrefix = process.env.ASSET_PREFIX ?? "";
const prefixedRegistryURL: string = `${assetPrefix}/api/registry/`;

export function makeInternalRegistryAPIwithParams(internalIdentifier: InternalApiIdentifier, ...params: string[]): string {
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
      });
      break;
    case "contract_status":
      searchParams = new URLSearchParams({
        id: params[0],
      });
      break;
    case "instances":
      searchParams = new URLSearchParams({
        type: params[0],
        label: params[1] ?? null,
        identifier: params[2] ?? null,
        subtype: params[3] ?? null,
      });
      break;
    case "event":
      searchParams = new URLSearchParams({
        stage: params[0],
        type: params[1],
        identifier: params[2] ?? null,
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
      });
      break;
  }
  return `${prefixedRegistryURL}${internalIdentifier}?${searchParams.toString()}`;
}