import { parseStringsForUrls } from "./client-utils";

export enum InternalApiIdentifier {
  FORM = "form",
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
      case InternalApiIdentifier.FORM:
        urlParams = new URLSearchParams({
          entityType: parseStringsForUrls(params[0]),
          identifier: params[1] ?? null,
        });
        break;

    }
    return this.BASE_REGISTRY_PATH + apiKey +
      // Append url params if they exist
      urlParams ? `?${urlParams.toString()}` : "";
  }
}