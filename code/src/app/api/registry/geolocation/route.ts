import SettingsStore from "io/config/settings";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // agentApi is required
  const agentApi = SettingsStore.getRegistryURL();
  if (!agentApi) {
    return NextResponse.json({ error: "Missing agentApi parameter" }, { status: 400 });
  }

  // Build backend URL with all other params except agentApi
  const backendParams = new URLSearchParams();
  for (const [key, value] of searchParams.entries()) {
    if (key !== "agentApi" && value) {
      backendParams.append(key, value);
    }
  }
  const backendUrl = `${agentApi}?${backendParams.toString()}`;

  // Get the bearer token from the custom header
  const bearerToken = req.headers.get("x-bearer-token");

  // Proxy the request to the backend
  const backendRes = await fetch(backendUrl, {
    headers: {
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    cache: "no-store",
  });

  const results = await backendRes.text();

  if (results === "There are no coordinates associated with the parameters in the knowledge graph.") {
    return NextResponse.json([]);
  }

  try {
    return NextResponse.json(JSON.parse(results));
  } catch {
    return NextResponse.json({ error: "Invalid backend response" }, { status: 500 });
  }
}