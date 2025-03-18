import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fetchScenarios } from 'utils/fetchScenarios';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.split(' ')[1] || null;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const scenarios = await fetchScenarios(token);
        return NextResponse.json(scenarios);
    } catch (error) {
        console.error('Error fetching scenarios in API route', error);
        return NextResponse.json({ error: 'Error fetching scenarios' }, { status: 500 });
    }
}