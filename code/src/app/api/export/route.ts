import SettingsStore from "io/config/settings";
import { NextRequest, NextResponse } from "next/server";
import { AgentResponseBody } from "types/backend-agent";
import { UISettings } from "types/settings";
import { buildUrl } from "utils/client-utils";
import { getBackendApi } from "utils/internal-api-services";

/**
 * GET request handler
*/
export async function GET(
  req: NextRequest,
): Promise<NextResponse<AgentResponseBody>> {
  const { searchParams } = new URL(req.url);
  const id: string = searchParams.get("id");
  const resource: string = searchParams.get("resource");

  // Validate the resource parameter to prevent SSRF/path manipulation
  const resourcePattern = /^[A-Za-z0-9._-]+$/;
  if (!resource || !resourcePattern.test(resource)) {
    return NextResponse.json(
      { apiVersion: "1.0.0", error: { code: 400, message: "Invalid resource parameter" } },
      { status: 400 }
    );
  }
  let apiUrl: string;
  // When retrieving resources configured in the UI settings
  if (resource === "default") {
    // The ID corresponds to the index of the link in the UI settings links array
    const settings: UISettings = SettingsStore.getUISettings();
    const url: string = settings.links[parseInt(id)]?.url;

    const apiSearchParams: URLSearchParams = new URLSearchParams();
    apiSearchParams.append("start", searchParams.get("start"));
    apiSearchParams.append("end", searchParams.get("end"));
    apiUrl = `${url}?${apiSearchParams.toString()}`;
  } else {
    let url: string;
    try {
      const urlPrefix: string = getBackendApi("FILE_EXPORTER");
      url = buildUrl(urlPrefix, "export", resource);
    } catch {
      return NextResponse.json(
        { apiVersion: "1.0.0", error: { code: 503, message: "File exporter service is not configured!" } },
        { status: 503 }
      );
    }

    const apiSearchParams: URLSearchParams = new URLSearchParams({ id });
    apiUrl = `${url}?${apiSearchParams.toString()}`;
  }
  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Accept": req.headers.get("accept"),
    },
  });

  if (response.ok) {
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = response.headers.get("content-disposition") || "attachment";
    const fileBuffer: ArrayBuffer = await response.arrayBuffer();
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
        "Access-Control-Expose-Headers": "Content-Disposition",
      },
    })
  }

  return NextResponse.json(
    { apiVersion: "1.0.0", error: { code: 502, message: "Invalid API configured!" } },
    { status: 502 }
  );
}