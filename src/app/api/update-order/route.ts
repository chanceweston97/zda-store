// NOTE: This route is no longer functional without a database adapter.
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    return NextResponse.json(
    { 
      error: 'Order updates are not available. Orders are now managed through WooCommerce.'
    },
    { status: 503 }
    );
}
