import { NextResponse } from 'next/server';
import { getTiendasByDepartamento } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const departamento = searchParams.get('departamento');
  const municipio = searchParams.get('municipio');
  if (!departamento) {
    return NextResponse.json(
      { error: 'Parámetro requerido: departamento' },
      { status: 400 },
    );
  }
  try {
    const tiendas = await getTiendasByDepartamento(departamento, municipio);
    return NextResponse.json({ tiendas });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Error desconocido' },
      { status: 500 },
    );
  }
}
