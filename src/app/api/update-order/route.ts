// NOTE: Sanity has been removed. This route is no longer functional.
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    return NextResponse.json(
    { 
      error: 'Order updates are not available. Sanity has been removed. Orders are now managed through Medusa.'
    },
    { status: 503 }
    );
}
