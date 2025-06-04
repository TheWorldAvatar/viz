import SettingsStore from "io/config/settings";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    // Expecting: { agentApi: string, action: "rescind" | "terminate", formData: object }
    const { action, formData } = await req.json();
    const agentApi = SettingsStore.getRegistryURL();

    if (!agentApi || !action || !formData) {
        return NextResponse.json(
            { success: false, message: "Missing agentApi, action, or formData" },
            { status: 400 }
        );
    }

    // Build the external endpoint
    const url = `${agentApi}/contracts/archive/${action}`;

    // Proxy the request
    const externalRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        cache: "no-store",
    });

    const responseBody = await externalRes.json();

    return NextResponse.json({
        ...responseBody,
        success: externalRes.ok,
    }, { status: externalRes.status });
}