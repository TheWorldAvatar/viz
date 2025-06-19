// Next.js API route for proxying GeoServer requests
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");
    if (!targetUrl) {
        return NextResponse.json({ error: "Missing 'url' query parameter" }, { status: 400 });
    }

    // Copy headers, but remove host and connection headers
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
        if (key.toLowerCase() !== "host" && key.toLowerCase() !== "connection") {
            headers[key] = value;
        }
    });

    // const bearerToken = TODO

    try {
        const response = await fetch(targetUrl, {
            method: "GET",
            headers,
        });
        const contentType = response.headers.get("content-type") || "application/octet-stream";
        const buffer = await response.arrayBuffer();
        return new NextResponse(Buffer.from(buffer), {
            status: response.status,
            headers: {
                "content-type": contentType,
                // Optionally copy other headers
            },
        });
    } catch (error) {
        const status = 500;
        let message = "Geoserver proxy error";
        if (typeof error === "object" && error !== null) {
            if (error instanceof Error && error.message) {
                message = error.message;
            }
        }
        return NextResponse.json({ error: message }, { status });
    }
}
