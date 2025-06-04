// Next.js API route for proxying GeoServer requests
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import axios from "axios";

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
        const response = await axios.get(targetUrl, {
            headers,
            responseType: "arraybuffer",
        });
        const contentType = response.headers["content-type"] || "application/octet-stream";
        return new NextResponse(response.data, {
            status: response.status,
            headers: {
                "content-type": contentType,
                // Optionally copy other headers
            },
        });
    } catch (error) {
        // error is unknown, but axios errors have response property
        let status = 500;
        let message = "Proxy error";
        if (typeof error === "object" && error !== null) {
            // Try to extract status and message from axios error
            const err = error as Record<string, unknown>;
            if (err.response && typeof err.response === "object" && err.response !== null) {
                const resp = err.response as Record<string, unknown>;
                if (typeof resp.status === "number") status = resp.status;
                if (resp.data) message = String(resp.data);
            } else if (typeof err.message === "string") {
                message = err.message;
            }
        }
        return NextResponse.json({ error: message }, { status });
    }
}
