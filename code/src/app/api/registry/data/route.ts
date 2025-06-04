import SettingsStore from 'io/config/settings';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Get query params
  const { searchParams } = new URL(req.url);
  const agentApi = SettingsStore.getRegistryURL();
  const entityType = searchParams.get('entityType');
  const identifier = searchParams.get('identifier');
  const subEntityType = searchParams.get('subEntityType');
  const requireLabel = searchParams.get('requireLabel');

  // Get the bearer token from the custom header
  const bearerToken = req.headers.get('x-bearer-token');

  // Build the backend URL
  let url = `${agentApi}/${entityType}`;
  if (requireLabel === 'true') url += `/label`;
  if (identifier) {
    url += `/${identifier}`;
    if (subEntityType) url += `/${subEntityType}`;
  }

  // Forward the request to your backend with the token
  const backendRes = await fetch(url, {
    headers: {
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    cache: 'no-store',
  });

  const data = await backendRes.json();
  return NextResponse.json(data);
}