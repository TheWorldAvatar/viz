import SettingsStore from "io/config/settings";
import { NextRequest, NextResponse } from "next/server";
import { AgentResponseBody } from "types/backend-agent";
import { UISettings } from "types/settings";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<AgentResponseBody>> {
  try {
    const { searchParams } = new URL(req.url);
    const id: string = searchParams.get("id");

    const settings: UISettings = SettingsStore.getUISettings();
    const url: string = settings.links[parseInt(id)]?.url;

    const data = await req.formData();

    const backendResponse = await fetch(url, {
      method: "POST",
      body: data,
    });

    const result = await backendResponse.json();
    return NextResponse.json(result, { status: backendResponse.status });

  } catch (error) {
    console.error("Error in file upload:", error);
    return NextResponse.json(
      { apiVersion: "1.0.0", error: { code: 500, message: "Internal server error" } },
      { status: 500 }
    );
  }

}