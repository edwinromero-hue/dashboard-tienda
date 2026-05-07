import { NextResponse } from 'next/server';
import { getProductosByTienda } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tiendaId = searchParams.get('tienda');
  if (!tiendaId) {
    return NextResponse.json(
      { error: 'Parámetro requerido: tienda' },
      { status: 400 },
    );
  }
  try {
    const productos = await getProductosByTienda(tiendaId);
    return NextResponse.json({ productos });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Error desconocido' },
      { status: 500 },
    );
  }
}
