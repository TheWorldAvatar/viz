import SettingsStore from "io/config/settings";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const agentApi = SettingsStore.getRegistryURL();
  const lifecycleStage = searchParams.get("lifecycleStage");
  const eventType = searchParams.get("eventType");
  const identifier = searchParams.get("identifier");

  if (!agentApi || !lifecycleStage || !eventType || !identifier) {
    return NextResponse.json(
      { error: "Missing one or more required parameters: agentApi, lifecycleStage, eventType, identifier" },
      { status: 400 }
    );
  }

  // Get the bearer token from the custom header
  const bearerToken = req.headers.get("x-bearer-token");

  // Build the backend URL
  const url = `${agentApi}/contracts/${lifecycleStage}/${eventType}/${identifier}`;

  // Proxy the request to the backend
  const backendRes = await fetch(url, {
    headers: {
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    cache: "no-store",
  });

  if (!backendRes.ok) {
    return NextResponse.json({ error: "Failed to fetch lifecycle form template" }, { status: backendRes.status });
  }

  const form = await backendRes.text();
  try {
    const parsed = JSON.parse(form);
    return NextResponse.json(parsed.property);
  } catch {
    return NextResponse.json({ error: "Invalid backend response" }, { status: 500 });
  }
}