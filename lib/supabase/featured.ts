import 'server-only';
import { getSupabaseServer, isSupabaseConfigured } from './client';
import {
  stateNameToCodigo,
  nombreDepartamento,
  CODE_TO_DB_STATE,
} from '@/lib/geo/department-codes';
import { mpioToDbCity } from '@/lib/geo/municipality-aliases';
import { mockFeaturedProducts } from './mock-data';

export interface FeaturedProduct {
  id: string;
  nombre: string;
  precio: number;
  comparePrecio: number | null;
  categoria: string | null;
  imagenUrl: string | null;
  tiendaId: string;
  tiendaNombre: string;
  tiendaLogo: string | null;
  departamentoCodigo: string | null;
  departamentoNombre: string;
  city: string | null;
}

interface FeaturedFilters {
  departamentoCodigo?: string | null;
  municipioMpioName?: string | null;
}

/**
 * Selecciona productos destacados al azar.
 * Si se pasa departamento (y opcionalmente municipio), filtra por stores activos
 * en esa zona geográfica.
 */
export async function getFeaturedProducts(
  limit = 6,
  filters: FeaturedFilters = {},
): Promise<FeaturedProduct[]> {
  const sb = getSupabaseServer();
  if (!isSupabaseConfigured || !sb) {
    return mockFeaturedProducts(limit, {
      departamentoCodigo: filters.departamentoCodigo,
      municipioMpioName: filters.municipioMpioName,
    });
  }

  // Si hay filtro geográfico, primero obtenemos los store IDs candidatos.
  let storeFilter: number[] | null = null;
  if (filters.departamentoCodigo) {
    const stateName = CODE_TO_DB_STATE[filters.departamentoCodigo];
    if (!stateName) return [];

    let storeQuery = sb
      .from('store')
      .select('id, address:address_id!inner(state, city)')
      .eq('is_active', true)
      .eq('address.state', stateName);
    if (filters.municipioMpioName) {
      storeQuery = storeQuery.eq('address.city', mpioToDbCity(filters.municipioMpioName));
    }
    const { data: storesData } = await storeQuery.limit(2000);
    storeFilter = (storesData ?? []).map((s: any) => Number(s.id));
    if (!storeFilter.length) return [];
  }

  // Pool aleatorio sobre productos activos
  const POOL_SIZE = storeFilter ? Math.min(2000, storeFilter.length * 30) : 5000;
  const fetchSize = Math.max(limit * 5, 30);
  const offset = Math.floor(Math.random() * Math.max(1, POOL_SIZE - fetchSize));

  let productQuery = sb
    .from('product')
    .select('id, name, price, compare_price, general_category_id, store_id')
    .eq('status', 'active')
    .not('general_category_id', 'is', null);

  if (storeFilter) {
    productQuery = productQuery.in('store_id', storeFilter);
  }

  const { data: productos, error } = await productQuery
    .order('id', { ascending: false })
    .range(offset, offset + fetchSize - 1);

  if (error || !productos?.length) return [];

  // Buscar imágenes primarias
  const productIds = productos.map((p: any) => p.id);
  const storeIds = Array.from(new Set(productos.map((p: any) => p.store_id)));
  const categoryIds = Array.from(
    new Set(productos.map((p: any) => p.general_category_id).filter(Boolean)),
  );

  const [imgRes, storeRes, catRes] = await Promise.all([
    sb
      .from('product_image')
      .select('product_id, url, is_primary')
      .in('product_id', productIds),
    sb
      .from('store')
      .select(
        'id, store_name, logo_url, is_active, address:address_id!inner(state, city)',
      )
      .in('id', storeIds)
      .eq('is_active', true),
    sb.from('general_category').select('id, name').in('id', categoryIds),
  ]);

  const imageByProduct = new Map<number, string>();
  for (const img of imgRes.data ?? []) {
    const pid = (img as any).product_id;
    if ((img as any).is_primary) {
      imageByProduct.set(pid, (img as any).url);
    } else if (!imageByProduct.has(pid)) {
      imageByProduct.set(pid, (img as any).url);
    }
  }

  const storeById = new Map<number, any>();
  for (const s of storeRes.data ?? []) {
    storeById.set((s as any).id, s);
  }

  const catNameById = new Map<number, string>();
  for (const c of catRes.data ?? []) {
    catNameById.set((c as any).id, (c as any).name);
  }

  // Filtrar a productos con imagen + store válido + departamento mapeable, mezclar y tomar `limit`
  const enriched: FeaturedProduct[] = [];
  for (const p of productos) {
    const pp = p as any;
    const url = imageByProduct.get(pp.id);
    const store = storeById.get(pp.store_id);
    if (!url || !store) continue;

    const stateName = store.address?.state ?? null;
    const codigo = stateName ? stateNameToCodigo(stateName) : null;
    if (!codigo) continue;

    const compare = pp.compare_price != null ? Number(pp.compare_price) : null;
    enriched.push({
      id: String(pp.id),
      nombre: pp.name ?? 'Producto',
      precio: Number(pp.price ?? 0),
      comparePrecio: compare && compare > Number(pp.price ?? 0) ? compare : null,
      categoria: catNameById.get(pp.general_category_id) ?? null,
      imagenUrl: url,
      tiendaId: String(pp.store_id),
      tiendaNombre: store.store_name ?? 'Tienda',
      tiendaLogo: store.logo_url ?? null,
      departamentoCodigo: codigo,
      departamentoNombre: nombreDepartamento(codigo),
      city: store.address?.city ?? null,
    });

    if (enriched.length >= limit) break;
  }

  // Shuffle final para no quedarnos siempre con el mismo orden de id desc
  for (let i = enriched.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [enriched[i], enriched[j]] = [enriched[j], enriched[i]];
  }

  return enriched;
}
