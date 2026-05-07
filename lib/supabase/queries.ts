import 'server-only';
import type { Tienda, Producto, CategoryStat } from '@/types/domain';
import { getSupabaseServer, isSupabaseConfigured } from './client';
import { stateNameToCodigo, CODE_TO_DB_STATE } from '@/lib/geo/department-codes';
import { mpioToDbCity } from '@/lib/geo/municipality-aliases';
import {
  mockTiendaCountByDepartamento,
  mockTiendasByDepartamento,
  mockProductosByTienda,
  mockCategoryBreakdown,
  mockStoreIdsByCategoria,
  mockTiendaCountByMunicipio,
} from './mock-data';

// Schema real (descubierto vía /api/debug):
// - store(id, store_name, address_id, contact_phone, status, is_active, ...)
// - address(id, state, city, country, formatted_address, ...)  state=DEPT NAME UPPERCASE
// - product(id, store_id, name, price, status, general_category_id, ...)
// - product_image(id, product_id, url, is_primary, sort_order)
// - general_category(id, name, ...)

const ACTIVE_STORE_FILTER = { is_active: true } as const;

export async function getTiendaCountByDepartamento(): Promise<Record<string, number>> {
  const sb = getSupabaseServer();
  if (!isSupabaseConfigured || !sb) return mockTiendaCountByDepartamento();

  // 33 conteos paralelos con head:true (cada uno es metadata, ~ms).
  // Esto evita el cap de PostgREST en `data` (default 1000 filas).
  const codigos = Object.keys(CODE_TO_DB_STATE);
  const results = await Promise.all(
    codigos.map(async (codigo) => {
      const { count, error } = await sb
        .from('store')
        .select('id, address:address_id!inner(state)', {
          count: 'exact',
          head: true,
        })
        .eq('is_active', true)
        .eq('address.state', CODE_TO_DB_STATE[codigo]);
      if (error) return [codigo, 0] as const;
      return [codigo, count ?? 0] as const;
    }),
  );

  return Object.fromEntries(results.filter(([, c]) => c > 0));
}

export async function getTiendasByDepartamento(
  codigo: string,
  municipioMpioName?: string | null,
): Promise<Tienda[]> {
  const sb = getSupabaseServer();
  if (!isSupabaseConfigured || !sb) return mockTiendasByDepartamento(codigo);

  const stateName = CODE_TO_DB_STATE[codigo];
  if (!stateName) return [];

  let query = sb
    .from('store')
    .select(
      'id, store_name, contact_phone, logo_url, banner_url, address:address_id!inner(state, formatted_address, city)',
    )
    .match(ACTIVE_STORE_FILTER)
    .eq('address.state', stateName);

  if (municipioMpioName) {
    query = query.eq('address.city', mpioToDbCity(municipioMpioName));
  }

  const { data, error } = await query.order('store_name').limit(2000);

  if (error) throw error;

  return (data ?? []).map((s: any) => {
    const addr = s.address ?? {};
    return {
      id: String(s.id),
      nombre: s.store_name ?? 'Tienda',
      direccion: cleanAddress(addr),
      telefono: s.contact_phone ?? null,
      departamentoCodigo: codigo,
      logoUrl: s.logo_url ?? null,
      bannerUrl: s.banner_url ?? null,
    } satisfies Tienda;
  });
}

// `formatted_address` viene a veces con la ciudad/depto duplicados.
// Construimos una versión limpia: street, city.
function cleanAddress(addr: { formatted_address?: string; city?: string; state?: string } | null): string {
  if (!addr) return '—';
  const formatted = (addr.formatted_address ?? '').trim();
  if (formatted) {
    // Tomar solo la primera parte significativa (antes de la primera repetición de city/state)
    const segments = formatted.split(',').map((s) => s.trim()).filter(Boolean);
    const seen = new Set<string>();
    const dedup: string[] = [];
    for (const seg of segments) {
      const key = seg.toLowerCase().replace(/\./g, '');
      if (seen.has(key)) continue;
      seen.add(key);
      dedup.push(seg);
      if (dedup.length >= 2) break; // street + city
    }
    return dedup.join(', ');
  }
  return [addr.city, addr.state].filter(Boolean).join(', ') || '—';
}

export async function getProductosByTienda(tiendaId: string): Promise<Producto[]> {
  const sb = getSupabaseServer();
  if (!isSupabaseConfigured || !sb) return mockProductosByTienda(tiendaId);

  const numericStoreId = Number(tiendaId);
  if (Number.isNaN(numericStoreId)) return [];

  // 1) Productos activos de la tienda
  const { data: productos, error } = await sb
    .from('product')
    .select('id, name, price, general_category_id, store_id, status')
    .eq('store_id', numericStoreId)
    .eq('status', 'active')
    .order('name')
    .limit(200);

  if (error) throw error;
  if (!productos?.length) return [];

  const productIds = productos.map((p: any) => p.id);
  const categoryIds = Array.from(
    new Set(productos.map((p: any) => p.general_category_id).filter(Boolean)),
  );

  // 2) Imágenes primarias en paralelo
  const [imgRes, catRes] = await Promise.all([
    sb
      .from('product_image')
      .select('product_id, url, is_primary, sort_order')
      .in('product_id', productIds),
    categoryIds.length
      ? sb.from('general_category').select('id, name').in('id', categoryIds)
      : Promise.resolve({ data: [] as any[], error: null }),
  ]);

  // Por producto: preferir is_primary; fallback al de menor sort_order
  const imageByProduct = new Map<number, string>();
  for (const img of imgRes.data ?? []) {
    const pid = (img as any).product_id;
    if ((img as any).is_primary) {
      imageByProduct.set(pid, (img as any).url);
    } else if (!imageByProduct.has(pid)) {
      imageByProduct.set(pid, (img as any).url);
    }
  }

  const catNameById = new Map<number, string>();
  for (const c of catRes.data ?? []) {
    catNameById.set((c as any).id, (c as any).name);
  }

  return productos.map((p: any) => ({
    id: String(p.id),
    tiendaId: String(p.store_id),
    nombre: p.name ?? 'Producto',
    precio: Number(p.price ?? 0),
    categoria: catNameById.get(p.general_category_id) ?? 'Sin categoría',
    imagenUrl: imageByProduct.get(p.id) ?? null,
  }));
}

export async function getCategoryBreakdownByDepartamento(
  codigo: string,
): Promise<CategoryStat[]> {
  const sb = getSupabaseServer();
  if (!isSupabaseConfigured || !sb) return mockCategoryBreakdown(codigo);

  const stateName = CODE_TO_DB_STATE[codigo];
  if (!stateName) return [];

  // 1) IDs de stores activos en el departamento
  const { data: storesData, error: e1 } = await sb
    .from('store')
    .select('id, address:address_id!inner(state)')
    .match(ACTIVE_STORE_FILTER)
    .eq('address.state', stateName)
    .limit(2000);
  if (e1) throw e1;
  const storeIds = (storesData ?? []).map((s: any) => s.id);
  if (!storeIds.length) return [];

  // 2) Productos activos de esos stores con su general_category_id
  const { data: productos, error: e2 } = await sb
    .from('product')
    .select('general_category_id')
    .in('store_id', storeIds)
    .eq('status', 'active')
    .not('general_category_id', 'is', null)
    .limit(20000);
  if (e2) throw e2;

  const counts = new Map<number, number>();
  for (const p of productos ?? []) {
    const cid = (p as any).general_category_id;
    if (cid != null) counts.set(cid, (counts.get(cid) ?? 0) + 1);
  }
  if (counts.size === 0) return [];

  // 3) Nombres de las categorías
  const ids = Array.from(counts.keys());
  const { data: cats, error: e3 } = await sb
    .from('general_category')
    .select('id, name')
    .in('id', ids);
  if (e3) throw e3;

  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0) || 1;
  return (cats ?? [])
    .map((c: any) => {
      const n = counts.get(c.id) ?? 0;
      return {
        categoriaId: Number(c.id),
        categoria: c.name as string,
        totalProductos: n,
        porcentaje: (n / total) * 100,
      };
    })
    .sort((a, b) => b.totalProductos - a.totalProductos);
}

// Cantidad de tiendas activas por municipio (city) dentro de un departamento.
// Devuelve un mapa: cityNameUppercase → count.
export async function getTiendaCountByMunicipio(
  codigo: string,
): Promise<Record<string, number>> {
  const sb = getSupabaseServer();
  if (!isSupabaseConfigured || !sb) return mockTiendaCountByMunicipio(codigo);

  const stateName = CODE_TO_DB_STATE[codigo];
  if (!stateName) return {};

  // Como PostgREST no agrupa, traemos las stores con su city y agregamos en JS.
  // El cap de 1000 puede limitar deptos grandes (Bogotá ~2000) — paginamos.
  const counts: Record<string, number> = {};
  const PAGE = 1000;
  for (let offset = 0; offset < 5000; offset += PAGE) {
    const { data, error } = await sb
      .from('store')
      .select('id, address:address_id!inner(state, city)')
      .match(ACTIVE_STORE_FILTER)
      .eq('address.state', stateName)
      .range(offset, offset + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;
    for (const row of data) {
      const city = (row as any).address?.city;
      if (!city) continue;
      counts[city] = (counts[city] ?? 0) + 1;
    }
    if (data.length < PAGE) break;
  }
  return counts;
}

// Devuelve el set de store IDs (string) de un departamento que venden productos
// activos en una `general_category` específica. Para filtrar la lista en el panel.
export async function getStoreIdsByDepartamentoAndCategoria(
  codigo: string,
  categoriaId: number,
): Promise<string[]> {
  const sb = getSupabaseServer();
  if (!isSupabaseConfigured || !sb) return mockStoreIdsByCategoria(codigo, categoriaId);

  const stateName = CODE_TO_DB_STATE[codigo];
  if (!stateName) return [];

  // 1) Stores activos en el departamento
  const { data: stores, error: e1 } = await sb
    .from('store')
    .select('id, address:address_id!inner(state)')
    .match(ACTIVE_STORE_FILTER)
    .eq('address.state', stateName)
    .limit(2000);
  if (e1) throw e1;
  const storeIds = (stores ?? []).map((s: any) => s.id);
  if (!storeIds.length) return [];

  // 2) ¿Cuáles tienen al menos un producto activo en esa categoría?
  const { data: productos, error: e2 } = await sb
    .from('product')
    .select('store_id')
    .in('store_id', storeIds)
    .eq('status', 'active')
    .eq('general_category_id', categoriaId)
    .limit(20000);
  if (e2) throw e2;

  const ids = new Set<string>();
  for (const p of productos ?? []) {
    ids.add(String((p as any).store_id));
  }
  return Array.from(ids);
}
