import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const agentApi = searchParams.get("agentApi");
  const entityType = searchParams.get("entityType");
  const identifier = searchParams.get("identifier");

  if (!agentApi || !entityType) {
    return NextResponse.json(
      { error: "Missing required parameters: agentApi, entityType" },
      { status: 400 }
    );
  }

  // Get the bearer token from the custom header
  const bearerToken = req.headers.get("x-bearer-token");

  // Build the backend URL
  let url = `${agentApi}/form/${entityType}`;
  if (identifier) {
    url += `/${encodeURIComponent(identifier)}`;
  }

  // Proxy the request to the backend
  const backendRes = await fetch(url, {
    headers: {
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    cache: "no-store",
  });

  if (!backendRes.ok) {
    return NextResponse.json({ error: "Failed to fetch form template" }, { status: backendRes.status });
  }

  const data = await backendRes.json();
  return NextResponse.json(data);
}