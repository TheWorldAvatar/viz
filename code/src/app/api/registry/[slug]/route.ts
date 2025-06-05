import SettingsStore from "io/config/settings";
import { NextRequest, NextResponse } from "next/server";
import { LifecycleStage } from "types/form";
import { InternalApiIdentifier } from "utils/internal-api-services";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const agentBaseApi: string = SettingsStore.getRegistryURL();
  if (!agentBaseApi) {
    return NextResponse.json({ error: "Missing registry url in settings." }, { status: 400 });
  }

  // Generate API url and parameters based on the slug
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  let url: string = "";
  switch (slug) {
    case InternalApiIdentifier.ADDRESS: {
      const postalCode: string = searchParams.get("postal_code");
      const urlObj: URL = new URL(`${agentBaseApi}/location/addresses`);
      urlObj.searchParams.set("postal_code", postalCode);
      url = urlObj.toString();
      break;
    }
    case InternalApiIdentifier.CONCEPT: {
      const uri: string = searchParams.get("uri");

      const urlObj: URL = new URL(`${agentBaseApi}/type`);
      urlObj.searchParams.set("uri", encodeURIComponent(uri));
      url = urlObj.toString();
      break;
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
        return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
      }
      url = `${agentBaseApi}/contracts/${stagePath}?type=${entityType}&label=yes`;
      break;
    }
    case InternalApiIdentifier.CONTRACT_STATUS: {
      const id: string = searchParams.get("id");
      url = `${agentBaseApi}/contracts/status/${id}`;
      break;
    }
    case InternalApiIdentifier.INSTANCES: {
      const type: string = searchParams.get("type");
      const requireLabel: string = searchParams.get("label");
      const identifier: string = searchParams.get("identifier");
      const subtype: string = searchParams.get("subtype");

      url = `${agentBaseApi}/${type}`;
      if (requireLabel === "true") { url += `/label` };
      if (identifier != "null") {
        url += `/${identifier}`;
        if (subtype != "null") {
          url += `/${subtype}`
        };
      }
      break;
    }
    case InternalApiIdentifier.EVENT: {
      const stage = searchParams.get("stage");
      const eventType = searchParams.get("type");
      const identifier = searchParams.get("identifier");
      url = `${agentBaseApi}/contracts/${stage}/${eventType}/${identifier}`
      break;
    }
    case InternalApiIdentifier.FORM: {
      const entityType: string = searchParams.get("type");
      const identifier: string = searchParams.get("identifier");

      url = `${agentBaseApi}/form/${entityType}`;
      if (identifier != "null") {
        url += `/${encodeURIComponent(identifier)}`;
      }
      break;
    }
    case InternalApiIdentifier.GEOCODING_ADDRESS: {
      const block: string = searchParams.get("block");
      const street: string = searchParams.get("street");
      const urlParams = new URLSearchParams({ block, street, });
      url = `${agentBaseApi}/location/geocode?${urlParams.toString()}`;
      break;
    }
    case InternalApiIdentifier.GEOCODING_POSTAL: {
      const postalCode: string = searchParams.get("postalCode");
      const urlParams = new URLSearchParams({ "postal_code": postalCode, });
      url = `${agentBaseApi}/location/geocode?${urlParams.toString()}`;
      break;
    }
    case InternalApiIdentifier.GEOCODING_CITY: {
      const city: string = searchParams.get("city");
      const country: string = searchParams.get("country");
      const urlParams = new URLSearchParams({ city, country, });
      url = `${agentBaseApi}/location/geocode?${urlParams.toString()}`;
      break;
    }
    case InternalApiIdentifier.REVERSE_GEOCODING: {
      const iri: string = searchParams.get("iri");
      url = `${agentBaseApi}/location?iri=${encodeURIComponent(iri)}`;
      break;
    }
    case InternalApiIdentifier.SCHEDULE: {
      const id: string = searchParams.get("id");
      url = `${agentBaseApi}/contracts/schedule/${id}`;
      break;
    }
    case InternalApiIdentifier.TASKS: {
      const contractType: string = searchParams.get("type");
      const idOrTimestamp: string = searchParams.get("idOrTimestamp");
      url = `${agentBaseApi}/contracts/service/${idOrTimestamp}?type=${contractType}`;
      break;
    }
    default:
      return NextResponse.json({ error: "This API does not exist." }, { status: 404 });
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