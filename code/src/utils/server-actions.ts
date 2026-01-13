'use server'

import SettingsStore from "io/config/settings";
import { UISettings } from "types/settings";
import { buildUrl } from "./client-utils";
import { UrlExistsResponse } from "types/backend-agent";

/**
 * Performs a HEAD request to check if the url to the registry attachment exists.
 *
 * @param {string} contract id of the contract.
 */
export async function registryAttachmentUrlExists(contract: string): Promise<UrlExistsResponse> {
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const urlPrefix: string = uiSettings?.resources?.["registry-attachment"]?.url ?? "";
  if (urlPrefix == "") {
    return null;
  }
  const url: string = buildUrl(urlPrefix, contract, "");

  const response = await fetch(url, { method: "HEAD" });
  return {
    url,
    exists: response.ok,
  };
}