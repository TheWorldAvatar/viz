import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const agentApi = searchParams.get("agentApi");
  const contractType = searchParams.get("contractType");
  const id = searchParams.get("id");
  const time = searchParams.get("time");

  if (!agentApi || !contractType) {
    return NextResponse.json({ error: "Missing agentApi or contractType parameter" }, { status: 400 });
  }

  // Build the backend URL
  const pathParam = time ?? id ?? "";
  const url = `${agentApi}/contracts/service/${pathParam}?type=${contractType}`;

  // Get the bearer token from the custom header
  const bearerToken = req.headers.get("x-bearer-token");

  // Proxy the request to the backend
  const backendRes = await fetch(url, {
    headers: {
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    cache: "no-store",
  });

  if (!backendRes.ok) {
    return NextResponse.json({ error: "Failed to fetch service tasks" }, { status: backendRes.status });
  }

  const responseData = await backendRes.json();
  return NextResponse.json(responseData);
}