import SettingsStore from "io/config/settings";
import { NextRequest, NextResponse } from "next/server";
import { UISettings } from "types/settings";

export async function GET(req: NextRequest) {

    const uiSettings: UISettings = JSON.parse(SettingsStore.getUISettings());
    const agentApiUrl = uiSettings?.resources?.registry?.url;

    const { searchParams } = new URL(req.url);

    const backendResp = await fetch(`${agentApiUrl}?${searchParams}`)

    return NextResponse.json(backendResp.json)

}