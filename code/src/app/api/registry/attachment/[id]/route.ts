import SettingsStore from "io/config/settings";
import { NextRequest, NextResponse } from "next/server";
import { UrlExistsResponse } from "types/backend-agent";
import { UISettings } from "types/settings";
import { buildUrl } from "utils/client-utils";

/**
 * Get request handler
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<UrlExistsResponse>> {
  const uiSettings: UISettings = SettingsStore.getUISettings();
  const urlPrefix: string = uiSettings?.resources?.["registry-attachment"]?.url ?? "";
  if (urlPrefix == "") {
    return null;
  }

  // Build url with id parameter
  const { id } = await params;
  const url: string = buildUrl(urlPrefix, id, "");

  // Get the Accept-Language header from the request
  const acceptLanguageHeader = req.headers.get("accept-language");
  // Get the bearer token from the custom header
  const bearerToken = req.headers.get("x-bearer-token");

  const response = await fetch(url, {
    method: "HEAD", headers: {
      ...(acceptLanguageHeader && { "Accept-Language": acceptLanguageHeader }),
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    cache: "no-store",
  });

  return NextResponse.json({
    url,
    exists: response.ok,
  });
}