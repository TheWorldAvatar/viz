import { NextRequest, NextResponse } from "next/server";

import { AgentResponseBody } from "@/types/backend-agent";
import { FormTemplateType, FormTypeMap } from "@/types/form";
import { buildFormDefaults } from "@/utils/form-defaults";

const apiVersion = "5.30.5";

export async function GET(req: NextRequest): Promise<NextResponse<AgentResponseBody>> {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { apiVersion, error: { code: 400, message: "Missing task identifier." } },
      { status: 400 },
    );
  }

  const templateUrl = new URL("/api/registry/event", req.url);
  templateUrl.searchParams.set("stage", "service");
  templateUrl.searchParams.set("type", FormTypeMap.ACCRUAL);
  templateUrl.searchParams.set("identifier", id);

  try {
    const response = await fetch(templateUrl, {
      headers: {
        ...(req.headers.get("accept-language") && { "accept-language": req.headers.get("accept-language") as string }),
        ...(req.headers.get("x-bearer-token") && { "x-bearer-token": req.headers.get("x-bearer-token") as string }),
      },
      cache: "no-store",
    });
    const body = await response.json() as AgentResponseBody;
    if (!response.ok || body.error) {
      return NextResponse.json(body, { status: response.status || 502 });
    }

    const template = body.data?.items?.[0] as FormTemplateType;
    if (!template?.property) {
      return NextResponse.json(
        { apiVersion, error: { code: 502, message: "Accrual form template is unavailable." } },
        { status: 502 },
      );
    }

    return NextResponse.json({
      apiVersion,
      data: buildFormDefaults(template, { context: { id } }),
    });
  } catch (error) {
    console.error("Failed to build accrual defaults:", error);
    return NextResponse.json(
      { apiVersion, error: { code: 502, message: "Unable to prepare accrual defaults." } },
      { status: 502 },
    );
  }
}
