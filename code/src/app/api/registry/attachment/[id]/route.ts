import { NextRequest, NextResponse } from "next/server";
import { UrlExistsResponse } from "types/backend-agent";
import { buildUrl } from "utils/client-utils";
import { getBackendApi } from "utils/internal-api-services";

/**
 * Get request handler
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<UrlExistsResponse>> {
  let url: string = "";
  try {

    const urlPrefix: string = getBackendApi("REGISTRY_TASK_ATTACHMENT");
    // Build url with id parameter
    const { id } = await params;
    url = buildUrl(urlPrefix, id, "");
  } catch (_error) {
    console.error("Ignoring attachment checks as no valid API is configured!");
    return NextResponse.json({
      url,
      exists: false,
    });
  }

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