import { NextResponse } from 'next/server';
import { getCategoryBySlug } from '@/lib/data/unified-data';
import { medusaConfig } from '@/lib/medusa/config';
import { isMedusaEnabled } from '@/lib/medusa/config';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle') || 'antennas';
  
  try {
    const diagnostics = {
      backendUrl: medusaConfig.backendUrl,
      publishableKeySet: !!medusaConfig.publishableKey,
      medusaEnabled: isMedusaEnabled(),
      envNextPublicMedusaBackendUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
      envMedusaBackendUrl: process.env.MEDUSA_BACKEND_URL,
      handle,
    };
    
    const category = await getCategoryBySlug(handle);
    
    return NextResponse.json({
      success: true,
      diagnostics,
      category: category ? { 
        title: category.title, 
        id: category.id || category._id,
        handle: (category as any).handle,
      } : null,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      diagnostics: {
        backendUrl: medusaConfig.backendUrl,
        publishableKeySet: !!medusaConfig.publishableKey,
        medusaEnabled: isMedusaEnabled(),
        envNextPublicMedusaBackendUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
        envMedusaBackendUrl: process.env.MEDUSA_BACKEND_URL,
      },
      error: error?.message || String(error),
      stack: error?.stack,
    }, { status: 500 });
  }
}

