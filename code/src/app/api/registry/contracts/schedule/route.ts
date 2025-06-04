import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

    const { searchParams } = new URL(req.url)
    const agentApi = searchParams.get('agentApi');
    const id = searchParams.get('id');

    const bearerToken = req.headers.get('x-bearer-token');
    
    const url = `${agentApi}/contracts/schedule/${id}`

    const externalResponse = await fetch(url, {
        headers: {
            ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
        },
        cache: 'no-store',
    })

    const json = await externalResponse.json();

    return NextResponse.json(json)
}