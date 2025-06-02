import { NextRequest, NextResponse } from "next/server";

// Helper to parse JSON body
async function parseBody(req: NextRequest) {
    try {
        return await req.json();
    } catch {
        return null;
    }
}

export async function GET(req: NextRequest) {
    // Example: /api/registry/entity?entityType=foo
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get("entityType");
    // TODO: Fetch entities from data source
    return NextResponse.json({
        message: `Fetched entities of type ${entityType}`,
        success: true,
    });
}

export async function POST(req: NextRequest) {
    const body = await parseBody(req);
    if (!body || !body.entity) {
        return NextResponse.json({ message: "Missing entity data", success: false }, { status: 400 });
    }
    // TODO: Add entity to data source
    return NextResponse.json({
        message: `Added entity of type ${body.entity}`,
        success: true,
        iri: "some-generated-iri", // Replace with actual IRI if available
    });
}

export async function PUT(req: NextRequest) {
    const body = await parseBody(req);
    if (!body || !body.id) {
        return NextResponse.json({ message: "Missing entity id", success: false }, { status: 400 });
    }
    // TODO: Update entity in data source
    return NextResponse.json({
        message: `Updated entity with id ${body.id}`,
        success: true,
    });
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const entityType = searchParams.get("entityType");
    if (!id || !entityType) {
        return NextResponse.json({ message: "Missing id or entityType", success: false }, { status: 400 });
    }
    // TODO: Delete entity from data source
    return NextResponse.json({
        message: `Deleted entity ${id} of type ${entityType}`,
        success: true,
    });
}