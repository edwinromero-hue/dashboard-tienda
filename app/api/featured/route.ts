import { NextResponse } from 'next/server';
import { getFeaturedProducts } from '@/lib/supabase/featured';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(20, Math.max(1, Number(searchParams.get('limit') ?? '6')));
  const departamento = searchParams.get('departamento');
  const municipio = searchParams.get('municipio');
  try {
    const items = await getFeaturedProducts(limit, {
      departamentoCodigo: departamento,
      municipioMpioName: municipio,
    });
    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Error desconocido' },
      { status: 500 },
    );
  }
}
