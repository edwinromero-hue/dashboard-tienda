import { NextResponse } from 'next/server';
import { getHomeTiles } from '@/lib/supabase/home-tiles';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getHomeTiles();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Error desconocido' },
      { status: 500 },
    );
  }
}
