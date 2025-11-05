import SettingsStore from "io/config/settings";
import { NextRequest, NextResponse } from "next/server";
import { AgentResponseBody, InternalApiIdentifier } from "types/backend-agent";
import { logColours } from "utils/logColours";

const agentBaseApi: string = await SettingsStore.getRegistryURL();
const apiVersion: string = "5.30.5";

/**
 * GET request handler
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: InternalApiIdentifier }> }
): Promise<NextResponse<AgentResponseBody>> {
    if (!agentBaseApi) {
        return NextResponse.json(
            {
                apiVersion,
                error: { code: 400, message: "Missing billing url in settings." },
            },
            { status: 400 }
        );
    }

    // Generate API url and parameters based on the slug
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const url: string = makeExternalEndpoint(agentBaseApi, slug, searchParams);
    if (!url) {
        return NextResponse.json(
            { apiVersion, error: { code: 404, message: "This API does not exist." } },
            { status: 404 }
        );
    }
    // Get the Accept-Language header from the request
    const acceptLanguageHeader = req.headers.get("accept-language");
    // Get the bearer token from the custom header
    const bearerToken = req.headers.get("x-bearer-token");

    // Proxy the request to the backend
    let res;
    try {
        res = await fetch(url, {
            headers: {
                ...(acceptLanguageHeader && { "Accept-Language": acceptLanguageHeader }),
                ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
            },
            cache: "no-store",
        });
    } catch (error) {
        return NextResponse.json(handleFetchFailure(url, error));
    }

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
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: InternalApiIdentifier }> }
): Promise<NextResponse<AgentResponseBody>> {
    if (!agentBaseApi) {
        return NextResponse.json(
            {
                apiVersion,
                error: { code: 400, message: "Missing registry url in settings." },
            },
            { status: 400 }
        );
    }

    const body = await parseBody(req);
    if (!body) {
        return NextResponse.json(
            { apiVersion, error: { code: 400, message: "Missing data." } },
            { status: 400 }
        );
    }

    // Generate API url and parameters based on the slug
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const url: string = makeExternalEndpoint(agentBaseApi, slug, searchParams);
    if (!url) {
        return NextResponse.json(
            { apiVersion, error: { code: 404, message: "This API does not exist." } },
            { status: 404 }
        );
    }

    // Get the Accept-Language header from the request
    const acceptLanguageHeader = req.headers.get("accept-language");
    // Get the bearer token from the custom header
    const bearerToken = req.headers.get("x-bearer-token");
    const responseBody: AgentResponseBody = await sendRequest(
        url,
        acceptLanguageHeader,
        "POST",
        bearerToken,
        JSON.stringify(body)
    );
    return NextResponse.json(responseBody);
}

/**
 * PUT request handler
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ slug: InternalApiIdentifier }> }
): Promise<NextResponse<AgentResponseBody>> {
    if (!agentBaseApi) {
        return NextResponse.json(
            {
                apiVersion,
                error: { code: 400, message: "Missing billing url in settings." },
            },
            { status: 400 }
        );
    }

    const body = await parseBody(req);
    if (!body) {
        return NextResponse.json(
            { apiVersion, error: { code: 400, message: "Missing data." } },
            { status: 400 }
        );
    }

    // Generate API url and parameters based on the slug
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const url: string = makeExternalEndpoint(agentBaseApi, slug, searchParams);
    if (!url) {
        return NextResponse.json(
            { apiVersion, error: { code: 404, message: "This API does not exist." } },
            { status: 404 }
        );
    }
    // Get the Accept-Language header from the request
    const acceptLanguageHeader = req.headers.get("accept-language");
    // Get the bearer token from the custom header
    const bearerToken = req.headers.get("x-bearer-token");
    const responseBody: AgentResponseBody = await sendRequest(
        url,
        acceptLanguageHeader,
        "PUT",
        bearerToken,
        JSON.stringify(body)
    );
    return NextResponse.json(responseBody);
}

/**
 * DELETE request handler
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ slug: InternalApiIdentifier }> }
): Promise<NextResponse<AgentResponseBody>> {
    if (!agentBaseApi) {
        return NextResponse.json(
            {
                apiVersion,
                error: { code: 400, message: "Missing billing url in settings." },
            },
            { status: 400 }
        );
    }

    // Generate API url and parameters based on the slug
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const url: string = makeExternalEndpoint(agentBaseApi, slug, searchParams);
    if (!url) {
        return NextResponse.json(
            { apiVersion, error: { code: 404, message: "This API does not exist." } },
            { status: 404 }
        );
    }
    // Get the Accept-Language header from the request
    const acceptLanguageHeader = req.headers.get("accept-language");
    // Get the bearer token from the custom header
    const bearerToken: string | null = req.headers.get("x-bearer-token");
    const responseBody: AgentResponseBody = await sendRequest(
        url,
        acceptLanguageHeader,
        "DELETE",
        bearerToken
    );
    return NextResponse.json(responseBody);
}

function makeExternalEndpoint(
    agentBaseApi: string,
    slug: InternalApiIdentifier,
    searchParams: URLSearchParams
): string {
    switch (slug) {
        case "billing_accounts":
            return `${agentBaseApi}/billing/billing_accounts?${searchParams.toString()}`;
        case "pricing_models":
            return `${agentBaseApi}/billing/pricing_models?${searchParams.toString()}`;
        case "billing_activity":
            return `${agentBaseApi}/billing/billing_activity?${searchParams.toString()}`;
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

async function sendRequest(
    url: string,
    acceptLanguageHeader: string,
    methodType: "POST" | "PUT" | "DELETE",
    bearerToken: string | null,
    body?: string
): Promise<AgentResponseBody> {
    const options: RequestInit = {
        method: methodType,
        headers: {
            "Content-Type": "application/json",
            ...(acceptLanguageHeader && { "Accept-Language": acceptLanguageHeader }),
            ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
        },
        cache: "no-store",
    };

    if (body) {
        options.body = body;
    }
    let response;
    try {
        response = await fetch(url, options);

    } catch (error) {
        return handleFetchFailure(url, error);
    }
    const responseBody: AgentResponseBody = await response.json();
    return responseBody;
}

async function handleExternalBadRequest(res: Response, url: string): Promise<NextResponse<AgentResponseBody>> {
    const resBody: AgentResponseBody = await res.json();

    console.error(
        `${logColours.Red}Error${logColours.Reset} fetching from external API: ${logColours.Yellow}${url}${logColours.Reset}:`,
        resBody.error?.message
    );
    return NextResponse.json(
        {
            ...resBody,
            apiVersion,
        },
        { status: resBody.error?.code }
    );
}

function handleFetchFailure(url: string, error: unknown): AgentResponseBody {
    console.error(`[API Route Error] Fetch failed for ${url}:`);

    if (error instanceof Error) {
        console.error("Error Name: ", error.name);
        console.error("Error Message: ", error.message);
        if (error.cause) {
            console.error("Error Cause:", error.cause);

        }
        console.error("Stack Trace:", error.stack);
    } else {
        console.error("Unknown error type:", error);
    }

    return {
        apiVersion,
        error: {
            code: 500,
            message: "Failed to connect to external service"
        }
    }
}
