import SettingsStore from "io/config/settings";
import { NextRequest, NextResponse } from "next/server";
import { InternalApiIdentifier } from "utils/internal-api-services";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const agentBaseApi: string = SettingsStore.getRegistryURL();
  if (!agentBaseApi) {
    return NextResponse.json({ error: "Missing registry url in settings." }, { status: 400 });
  }

  const { slug } = await params;
  const { searchParams } = new URL(req.url);

  let url: string = "";
  if (slug == InternalApiIdentifier.FORM) {
    const entityType = searchParams.get("entityType");
    const identifier = searchParams.get("identifier");

    // Build the backend URL
    url = `${agentBaseApi}/form/${entityType}`;
    if (identifier) {
      url += `/${encodeURIComponent(identifier)}`;
    }
  } else {
    return NextResponse.json({ error: "This API does not exist." }, { status: 404 });
  }

  // Get the bearer token from the custom header
  const bearerToken = req.headers.get("x-bearer-token");

  console.log(url)
  // Proxy the request to the backend
  const res = await fetch(url, {
    headers: {
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch available types" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}