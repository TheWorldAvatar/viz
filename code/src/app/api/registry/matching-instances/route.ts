import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const { agentApi, entityType, form } = await req.json();

    if (!agentApi || !entityType || !form) {
      return NextResponse.json(
        { success: false, message: "Missing agentApi, entityType, or form" },
        { status: 400 }
      );
    }

    const url = `${agentApi}/${entityType}/search`;
    const reqBody = JSON.stringify(form);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: reqBody,
    });
    const responseBody = await response.text();

    return NextResponse.json({
      success: response.ok,
      message: responseBody,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}