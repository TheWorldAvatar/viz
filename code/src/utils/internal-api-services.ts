import { parseStringsForUrls } from "./client-utils";

export enum InternalApiIdentifier {
  ADDRESS = "address",
  CONCEPT = "concept",
  CONTRACTS = "contracts",
  CONTRACT_STATUS = "contract_status",
  EVENT = "event",
  FORM = "form",
  GEOCODING_POSTAL = "geocode_postal",
  GEOCODING_ADDRESS = "geocode_address",
  GEOCODING_CITY = "geocode_city",
  REVERSE_GEOCODING = "geodecode",
  INSTANCES = "instances",
  SCHEDULE = "schedule",
  TASKS = "tasks",
}

/**
 * Provides the endpoints to internal API services.
 */
export default class InternalApiServices {
  private static readonly ASSET_PREFIX = process.env.ASSET_PREFIX ?? "";
  private static readonly BASE_REGISTRY_PATH: string = `${this.ASSET_PREFIX}/api/registry/`;

  /**
   * Retrieves the registry API endpoint for a given internal API identifier.
   * @param {InternalApiIdentifier} apiKey - The enum identifier for the internal API service.
   */
  public static getRegistryApi(apiKey: InternalApiIdentifier, ...params: string[]): string {
    let urlParams: URLSearchParams;
    switch (apiKey) {
      case InternalApiIdentifier.ADDRESS:
        urlParams = new URLSearchParams({
          postal_code: params[0],
        });
        break;
      case InternalApiIdentifier.CONCEPT:
        urlParams = new URLSearchParams({
          uri: encodeURIComponent(params[0]),
        });
        break;
      case InternalApiIdentifier.CONTRACTS:
        urlParams = new URLSearchParams({
          stage: params[0],
          type: params[1],
        });
        break;
      case InternalApiIdentifier.CONTRACT_STATUS:
        urlParams = new URLSearchParams({
          id: params[0],
        });
        break;
      case InternalApiIdentifier.INSTANCES:
        urlParams = new URLSearchParams({
          type: params[0],
          label: params[1] ?? null,
          identifier: params[2] ?? null,
          subtype: params[3] ?? null,
        });
        break;
      case InternalApiIdentifier.EVENT:
        urlParams = new URLSearchParams({
          stage: params[0],
          type: params[1],
          identifier: params[2],
        });
        break;
      case InternalApiIdentifier.FORM:
        urlParams = new URLSearchParams({
          type: parseStringsForUrls(params[0]),
          identifier: params[1] ?? null,
        });
        break;
      case InternalApiIdentifier.GEOCODING_ADDRESS:
        urlParams = new URLSearchParams({
          block: params[0] ?? null,
          street: params[1] ?? null,
        });
        break;
      case InternalApiIdentifier.GEOCODING_POSTAL:
        urlParams = new URLSearchParams({
          postalCode: params[0] ?? null,
        });
        break;
      case InternalApiIdentifier.GEOCODING_CITY:
        urlParams = new URLSearchParams({
          city: params[0] ?? null,
          country: params[1] ?? null,
        });
        break;
      case InternalApiIdentifier.REVERSE_GEOCODING:
        urlParams = new URLSearchParams({
          iri: encodeURIComponent(params[0]),
        });
        break;
      case InternalApiIdentifier.SCHEDULE:
        urlParams = new URLSearchParams({
          id: params[0],
        });
        break;
      case InternalApiIdentifier.TASKS:
        urlParams = new URLSearchParams({
          type: params[0],
          idOrTimestamp: params[1],
        });
        break;
    }
    const queryParams: string = urlParams ? `?${urlParams.toString()}` : "";
    return this.BASE_REGISTRY_PATH + apiKey + queryParams;
  }
}