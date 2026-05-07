import { NextResponse } from 'next/server';
import { getCategoryBreakdownByDepartamento } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const departamento = searchParams.get('departamento');
  if (!departamento) {
    return NextResponse.json(
      { error: 'Parámetro requerido: departamento' },
      { status: 400 },
    );
  }
  try {
    const breakdown = await getCategoryBreakdownByDepartamento(departamento);
    return NextResponse.json({ breakdown });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Error desconocido' },
      { status: 500 },
    );
  }
}
