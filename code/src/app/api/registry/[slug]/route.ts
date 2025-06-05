import SettingsStore from "io/config/settings";
import { NextRequest, NextResponse } from "next/server";
import { CustomAgentResponseBody } from "types/backend-agent";
import { LifecycleStage } from "types/form";
import { InternalApiIdentifier } from "utils/internal-api-services";

/**
 * GET request handler
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const agentBaseApi: string = SettingsStore.getRegistryURL();
  if (!agentBaseApi) {
    return NextResponse.json({ error: "Missing registry url in settings." }, { status: 400 });
  }

  // Generate API url and parameters based on the slug
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const url: string = genEndpoint(agentBaseApi, slug, searchParams);
  if (!url) {
    return NextResponse.json({ error: "This API does not exist." }, { status: 404 })
  }
  // Get the bearer token from the custom header
  const bearerToken = req.headers.get("x-bearer-token");

  // Proxy the request to the backend
  const res = await fetch(url, {
    headers: {
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Request is unsuccessful." }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}

/**
 * POST request handler
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const agentBaseApi: string = SettingsStore.getRegistryURL();
  if (!agentBaseApi) {
    return NextResponse.json({ error: "Missing registry url in settings." }, { status: 400 });
  }

  const body = await parseBody(req);
  if (!body) {
    return NextResponse.json({ message: "Missing data", success: false }, { status: 400 });
  }

  // Generate API url and parameters based on the slug
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const url: string = genEndpoint(agentBaseApi, slug, searchParams);
  if (!url) {
    return NextResponse.json({ error: "This API does not exist." }, { status: 404 })
  }

  // Get the bearer token from the custom header
  const bearerToken = req.headers.get("x-bearer-token");
  const responseBody: CustomAgentResponseBody = await sendRequest(url, "POST", bearerToken, JSON.stringify(body));
  return NextResponse.json(responseBody);
}

/**
 * PUT request handler
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const agentBaseApi: string = SettingsStore.getRegistryURL();
  if (!agentBaseApi) {
    return NextResponse.json({ error: "Missing registry url in settings." }, { status: 400 });
  }

  const body = await parseBody(req);
  if (!body) {
    return NextResponse.json({ message: "Missing data", success: false }, { status: 400 });
  }

  // Generate API url and parameters based on the slug
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const url: string = genEndpoint(agentBaseApi, slug, searchParams);
  if (!url) {
    return NextResponse.json({ error: "This API does not exist." }, { status: 404 })
  }
  // Get the bearer token from the custom header
  const bearerToken = req.headers.get("x-bearer-token");
  const responseBody: CustomAgentResponseBody = await sendRequest(url, "PUT", bearerToken, JSON.stringify(body));
  return NextResponse.json(responseBody);
}

/**
 * DELETE request handler
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const agentBaseApi: string = SettingsStore.getRegistryURL();
  if (!agentBaseApi) {
    return NextResponse.json({ error: "Missing registry url in settings." }, { status: 400 });
  }

  // Generate API url and parameters based on the slug
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const url: string = genEndpoint(agentBaseApi, slug, searchParams);
  if (!url) {
    return NextResponse.json({ error: "This API does not exist." }, { status: 404 })
  }
  // Get the bearer token from the custom header
  const bearerToken: string | null = req.headers.get("x-bearer-token");
  const responseBody: CustomAgentResponseBody = await sendRequest(url, "DELETE", bearerToken);
  return NextResponse.json(responseBody);
}

function genEndpoint(agentBaseApi: string, slug: string, searchParams: URLSearchParams): string {
  switch (slug) {
    case InternalApiIdentifier.ADDRESS: {
      const postalCode: string = searchParams.get("postal_code");
      const urlObj: URL = new URL(`${agentBaseApi}/location/addresses`);
      urlObj.searchParams.set("postal_code", postalCode);
      return urlObj.toString();
    }
    case InternalApiIdentifier.CONCEPT: {
      const uri: string = searchParams.get("uri");

      const urlObj: URL = new URL(`${agentBaseApi}/type`);
      urlObj.searchParams.set("uri", encodeURIComponent(uri));
      return urlObj.toString();
    }
    case InternalApiIdentifier.CONTRACTS: {
      const entityType: string = searchParams.get("type");
      const stage: string = searchParams.get("stage");
      let stagePath: string;
      if (stage === LifecycleStage.PENDING.toString()) {
        stagePath = "draft";
      } else if (stage === LifecycleStage.ACTIVE.toString()) {
        stagePath = "service";
      } else if (stage === LifecycleStage.ARCHIVE.toString()) {
        stagePath = "archive";
      } else {
        throw Error('Invalid stage');
      }
      return `${agentBaseApi}/contracts/${stagePath}?type=${entityType}&label=yes`;
    }
    case InternalApiIdentifier.CONTRACT_STATUS: {
      const id: string = searchParams.get("id");
      return `${agentBaseApi}/contracts/status/${id}`;
    }
    case InternalApiIdentifier.INSTANCES: {
      const type: string = searchParams.get("type");
      const requireLabel: string = searchParams.get("label");
      const identifier: string = searchParams.get("identifier");
      const subtype: string = searchParams.get("subtype");

      let url: string = `${agentBaseApi}/${type}`;
      if (requireLabel === "true") { url += `/label` };
      if (identifier != "null") {
        url += `/${identifier}`;
        if (subtype != "null") {
          url += `/${subtype}`
        };
      }
      return url;
    }
    case InternalApiIdentifier.EVENT: {
      const stage = searchParams.get("stage");
      const eventType = searchParams.get("type");
      const identifier = searchParams.get("identifier");
      let url: string = `${agentBaseApi}/contracts/${stage}/${eventType}`;
      if (identifier != "null") {
        url += `/${identifier}`;
      }
      return url;
    }
    case InternalApiIdentifier.FORM: {
      const entityType: string = searchParams.get("type");
      const identifier: string = searchParams.get("identifier");

      let url: string = `${agentBaseApi}/form/${entityType}`;
      if (identifier != "null") {
        url += `/${encodeURIComponent(identifier)}`;
      }
      return url;
    }
    case InternalApiIdentifier.GEOCODING_ADDRESS: {
      const block: string = searchParams.get("block");
      const street: string = searchParams.get("street");
      const urlParams = new URLSearchParams({ block, street, });
      return `${agentBaseApi}/location/geocode?${urlParams.toString()}`;
    }
    case InternalApiIdentifier.GEOCODING_POSTAL: {
      const postalCode: string = searchParams.get("postalCode");
      const urlParams = new URLSearchParams({ "postal_code": postalCode, });
      return `${agentBaseApi}/location/geocode?${urlParams.toString()}`;
    }
    case InternalApiIdentifier.GEOCODING_CITY: {
      const city: string = searchParams.get("city");
      const country: string = searchParams.get("country");
      const urlParams = new URLSearchParams({ city, country, });
      return `${agentBaseApi}/location/geocode?${urlParams.toString()}`;
    }
    case InternalApiIdentifier.REVERSE_GEOCODING: {
      const iri: string = searchParams.get("iri");
      return `${agentBaseApi}/location?iri=${encodeURIComponent(iri)}`;
    }
    case InternalApiIdentifier.SCHEDULE: {
      const id: string = searchParams.get("id");
      return `${agentBaseApi}/contracts/schedule/${id}`;
    }
    case InternalApiIdentifier.TASKS: {
      const contractType: string = searchParams.get("type");
      const idOrTimestamp: string = searchParams.get("idOrTimestamp");
      return `${agentBaseApi}/contracts/service/${idOrTimestamp}?type=${contractType}`;
    }
    default:
      return null;
  }
}

async function parseBody(req: NextRequest) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

async function sendRequest(url: string, methodType: string, bearerToken: string | null, body?: string): Promise<CustomAgentResponseBody> {
  const options: RequestInit = {
    method: methodType,
    headers: {
      "Content-Type": "application/json",
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    cache: "no-store",

  };

  if (body) {
    options.body = body;
  }

  const response = await fetch(url, options);

  const responseBody: CustomAgentResponseBody = await response.json();
  return {
    ...responseBody,
    success: response.ok
  };
}