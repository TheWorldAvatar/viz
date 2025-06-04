import SettingsStore from "io/config/settings";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
    const { action, formData } = await req.json();
    const agentApi = SettingsStore.getRegistryURL();

    if ( !action || !formData) {
        return NextResponse.json(
            { success: false, message: "Missing agentApi, action, or formData" },
            { status: 400 }
        );
    }

    const url = `${agentApi}/contracts/service/${action}`;
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