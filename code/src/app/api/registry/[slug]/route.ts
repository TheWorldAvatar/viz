import SettingsStore from "io/config/settings";
import { NextRequest, NextResponse } from "next/server";
import { AgentResponseBody, InternalApiIdentifier } from "types/backend-agent";
import { LifecycleStage } from "types/form";
import { logColours } from "utils/logColours";

const agentBaseApi: string = await SettingsStore.getRegistryURL();
const apiVersion: string = "5.30.5";

/**
 * GET request handler
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: InternalApiIdentifier }> }) {
  if (!agentBaseApi) {
    return NextResponse.json({ apiVersion, error: { code: 400, message: "Missing registry url in settings." } }, { status: 400 });
  }

  // Generate API url and parameters based on the slug
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const url: string = makeExternalEndpoint(agentBaseApi, slug, searchParams);
  if (!url) {
    return NextResponse.json({ apiVersion, error: { code: 404, message: "This API does not exist." } }, { status: 404 })
  }
  // Get the Accept-Language header from the request
  const acceptLanguageHeader = req.headers.get("accept-language");
  // Get the bearer token from the custom header
  const bearerToken = req.headers.get("x-bearer-token");

  // Proxy the request to the backend
  const res = await fetch(url, {
    headers: {
      ...(acceptLanguageHeader && { 'Accept-Language': acceptLanguageHeader }),
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return await handleExternalBadRequest(res, url);
  }

  const data: AgentResponseBody = await res.json();
  return NextResponse.json({
    ...data,
    apiVersion,
  });
}

/**
 * POST request handler
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: InternalApiIdentifier }> }) {
  if (!agentBaseApi) {
    return NextResponse.json({ apiVersion, error: { code: 400, message: "Missing registry url in settings." } }, { status: 400 });
  }

  const body = await parseBody(req);
  if (!body) {
    return NextResponse.json({ apiVersion, error: { code: 400, message: "Missing data." } }, { status: 400 })
  }

  // Generate API url and parameters based on the slug
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const url: string = makeExternalEndpoint(agentBaseApi, slug, searchParams);
  if (!url) {
    return NextResponse.json({ apiVersion, error: { code: 404, message: "This API does not exist." } }, { status: 404 })
  }

  // Get the Accept-Language header from the request
  const acceptLanguageHeader = req.headers.get("accept-language");
  // Get the bearer token from the custom header
  const bearerToken = req.headers.get("x-bearer-token");
  const responseBody: AgentResponseBody = await sendRequest(url, acceptLanguageHeader, "POST", bearerToken, JSON.stringify(body));
  return NextResponse.json(responseBody);
}

/**
 * PUT request handler
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: InternalApiIdentifier }> }) {
  if (!agentBaseApi) {
    return NextResponse.json({ apiVersion, error: { code: 400, message: "Missing registry url in settings." } }, { status: 400 });
  }

  const body = await parseBody(req);
  if (!body) {
    return NextResponse.json({ apiVersion, error: { code: 400, message: "Missing data." } }, { status: 400 })
  }

  // Generate API url and parameters based on the slug
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const url: string = makeExternalEndpoint(agentBaseApi, slug, searchParams);
  if (!url) {
    return NextResponse.json({ apiVersion, error: { code: 404, message: "This API does not exist." } }, { status: 404 })
  }
  // Get the Accept-Language header from the request
  const acceptLanguageHeader = req.headers.get("accept-language");
  // Get the bearer token from the custom header
  const bearerToken = req.headers.get("x-bearer-token");
  const responseBody: AgentResponseBody = await sendRequest(url, acceptLanguageHeader, "PUT", bearerToken, JSON.stringify(body));
  return NextResponse.json(responseBody);
}

/**
 * DELETE request handler
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: InternalApiIdentifier }> }) {
  if (!agentBaseApi) {
    return NextResponse.json({ apiVersion, error: { code: 400, message: "Missing registry url in settings." } }, { status: 400 });
  }

  // Generate API url and parameters based on the slug
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const url: string = makeExternalEndpoint(agentBaseApi, slug, searchParams);
  if (!url) {
    return NextResponse.json({ apiVersion, error: { code: 404, message: "This API does not exist." } }, { status: 404 })
  }
  // Get the Accept-Language header from the request
  const acceptLanguageHeader = req.headers.get("accept-language");
  // Get the bearer token from the custom header
  const bearerToken: string | null = req.headers.get("x-bearer-token");
  const responseBody: AgentResponseBody = await sendRequest(url, acceptLanguageHeader, "DELETE", bearerToken);
  return NextResponse.json(responseBody);
}

function makeExternalEndpoint(agentBaseApi: string, slug: InternalApiIdentifier, searchParams: URLSearchParams): string {
  switch (slug) {
    case "address": {
      const postalCode: string = searchParams.get("postal_code");
      const urlObj: URL = new URL(`${agentBaseApi}/location/addresses`);
      urlObj.searchParams.set("postal_code", postalCode);
      return urlObj.toString();
    }
    case "concept": {
      const uri: string = searchParams.get("uri");

      const urlObj: URL = new URL(`${agentBaseApi}/type`);
      urlObj.searchParams.set("uri", uri);
      return urlObj.toString();
    }
    case "contracts": {
      const entityType: string = searchParams.get("type");
      const stage: LifecycleStage = searchParams.get("stage") as LifecycleStage;
      let stagePath: string;
      if (stage === "pending") {
        stagePath = "draft";
      } else if (stage === "active") {
        stagePath = "service";
      } else if (stage === "archive") {
        stagePath = "archive";
      } else {
        throw Error('Invalid stage');
      }
      return `${agentBaseApi}/contracts/${stagePath}?type=${entityType}&label=yes`;
    }
    case "contract_status": {
      const id: string = searchParams.get("id");
      return `${agentBaseApi}/contracts/status/${id}`;
    }
    case "instances": {
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
    case "event": {
      const stage = searchParams.get("stage");
      const eventType = searchParams.get("type");
      const identifier = searchParams.get("identifier");
      let url: string = `${agentBaseApi}/contracts/${stage}/${eventType}`;
      if (identifier != "null") {
        url += `/${identifier}`;
      }
      return url;
    }
    case "form": {
      const entityType: string = searchParams.get("type");
      const identifier: string = searchParams.get("identifier");

      let url: string = `${agentBaseApi}/form/${entityType}`;
      if (identifier != "null") {
        url += `/${encodeURIComponent(identifier)}`;
      }
      return url;
    }
    case "geocode_address": {
      const block: string = searchParams.get("block");
      const street: string = searchParams.get("street");
      const urlParams = new URLSearchParams({ block, street, });
      return `${agentBaseApi}/location/geocode?${urlParams.toString()}`;
    }
    case "geocode_postal": {
      const postalCode: string = searchParams.get("postalCode");
      const urlParams = new URLSearchParams({ "postal_code": postalCode, });
      return `${agentBaseApi}/location/geocode?${urlParams.toString()}`;
    }
    case "geocode_city": {
      const city: string = searchParams.get("city");
      const country: string = searchParams.get("country");
      const urlParams = new URLSearchParams({ city, country, });
      return `${agentBaseApi}/location/geocode?${urlParams.toString()}`;
    }
    case "geodecode": {
      const iri: string = searchParams.get("iri");
      return `${agentBaseApi}/location?iri=${encodeURIComponent(iri)}`;
    }
    case "schedule": {
      const id: string = searchParams.get("id");
      return `${agentBaseApi}/contracts/schedule/${id}`;
    }
    case "tasks": {
      const contractType: string = searchParams.get("type");
      const idOrTimestamp: string = searchParams.get("idOrTimestamp");
      return `${agentBaseApi}/contracts/service/${idOrTimestamp}?type=${contractType}`;
    }
    default:
      return null;
  }
}

async function parseBody(req: NextRequest): Promise<AgentResponseBody> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

async function sendRequest(url: string, acceptLanguageHeader: string, methodType: "POST" | "PUT" | "DELETE", bearerToken: string | null, body?: string): Promise<AgentResponseBody> {
  const options: RequestInit = {
    method: methodType,
    headers: {
      "Content-Type": "application/json",
      ...(acceptLanguageHeader && { 'Accept-Language': acceptLanguageHeader }),
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    cache: "no-store",

  };

  if (body) {
    options.body = body;
  }

  const response = await fetch(url, options);

  const responseBody: AgentResponseBody = await response.json();
  return responseBody;
}

async function handleExternalBadRequest(res: Response, url: string) {
  const resBody: AgentResponseBody = await res.json();

  console.error(`${logColours.Red}Error${logColours.Reset} fetching from external API: ${logColours.Yellow}${url}${logColours.Reset}:`, resBody.error?.message);
  return NextResponse.json(
    {
      ...resBody,
      apiVersion,
    },
    { status: resBody.error?.code }
  );
}