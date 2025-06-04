import SettingsStore from 'io/config/settings';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Get query parameters
  const { searchParams } = new URL(req.url);
  const agentApi = SettingsStore.getRegistryURL();
  const currentStage = searchParams.get('currentStage');
  const entityType = searchParams.get('entityType');

  const bearerToken = req.headers.get('x-bearer-token');
  // Map currentStage to backend path
  let stagePath: string | undefined;
  if (currentStage === 'pending') {
    stagePath = 'draft';
  } else if (currentStage === 'active') {
    stagePath = 'service';
  } else if (currentStage === 'archive') {
    stagePath = 'archive';
  } else {
    return NextResponse.json({ error: 'Invalid currentStage' }, { status: 400 });
  }

  // Get the bearer token from the custom header

  // Build the backend URL
  const url = `${agentApi}/contracts/${stagePath}?type=${entityType}&label=yes`;

  // Forward the request to your backend with the token
  const backendRes = await fetch(url, {
    headers: {
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    cache: 'no-store',
  });

  if (!backendRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch data from backend' }, { status: backendRes.status });
  }

  const data = await backendRes.json();
  return NextResponse.json(data);
}