import { NextRequest, NextResponse } from "next/server";
import { AgentResponseBody } from "types/backend-agent";
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

  let url: string;
  try {
    const urlPrefix: string = getBackendApi("FILE_EXPORTER");
    url = buildUrl(urlPrefix, "export", resource);
  } catch (_error) {
    return NextResponse.json(
      { apiVersion: "1.0.0", error: { code: 503, message: "File exporter service is not configured!" } },
      { status: 503 }
    );
  }

  const apiSearchParams: URLSearchParams = new URLSearchParams({ id });
  const apiUrl: string = `${url}?${apiSearchParams.toString()}`;
  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Accept": req.headers.get("accept"),
    },
  });
  if (response.ok) {
    return NextResponse.json(
      { apiVersion: "1.0.0", data: { message: apiUrl } },
      { status: 200 }
    );
  }
  if (response.status === 404) {
    return NextResponse.json(
      { apiVersion: "1.0.0", error: { code: 404, message: "Invalid API configured!" } },
      { status: 404 }
    );
  }
  const data: AgentResponseBody = await response.json();
  return NextResponse.json(data);
}