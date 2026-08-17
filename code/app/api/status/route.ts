import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}