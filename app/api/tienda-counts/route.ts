import { NextResponse } from 'next/server';
import { getTiendaCountByDepartamento } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const counts = await getTiendaCountByDepartamento();
    return NextResponse.json({ counts });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Error desconocido' },
      { status: 500 },
    );
  }
}
