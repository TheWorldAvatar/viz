import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const agentApi = searchParams.get("agentApi");
  const uri = searchParams.get("uri");

  if (!agentApi || !uri) {
    return NextResponse.json({ error: "Missing agentApi or uri parameter" }, { status: 400 });
  }

  // Get the bearer token from the custom header
  const bearerToken = req.headers.get("x-bearer-token");

  // Build the backend URL
  const url = `${agentApi}/type?uri=${encodeURIComponent(uri)}`;

  // Proxy the request to the backend
  const backendRes = await fetch(url, {
    headers: {
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    cache: "no-store",
  });

  if (!backendRes.ok) {
    return NextResponse.json({ error: "Failed to fetch available types" }, { status: backendRes.status });
  }

  const data = await backendRes.json();
  return NextResponse.json(data);
}