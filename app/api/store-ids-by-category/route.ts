import { NextResponse } from 'next/server';
import { getStoreIdsByDepartamentoAndCategoria } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const departamento = searchParams.get('departamento');
  const categoria = searchParams.get('categoria');
  if (!departamento || !categoria) {
    return NextResponse.json(
      { error: 'Parámetros requeridos: departamento, categoria' },
      { status: 400 },
    );
  }
  const catId = Number(categoria);
  if (Number.isNaN(catId)) {
    return NextResponse.json(
      { error: 'categoria debe ser numérico' },
      { status: 400 },
    );
  }
  try {
    const storeIds = await getStoreIdsByDepartamentoAndCategoria(departamento, catId);
    return NextResponse.json({ storeIds });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Error desconocido' },
      { status: 500 },
    );
  }
}
