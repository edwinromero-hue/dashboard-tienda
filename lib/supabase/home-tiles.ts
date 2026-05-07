import 'server-only';
import { getSupabaseServer, isSupabaseConfigured } from './client';
import {
  stateNameToCodigo,
  nombreDepartamento,
} from '@/lib/geo/department-codes';
import { getTiendaCountByDepartamento } from './queries';

export interface HomeStore {
  id: string;
  nombre: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  ciudad: string | null;
  departamentoCodigo: string | null;
  departamentoNombre: string;
}

export interface HomeCategory {
  id: number;
  nombre: string;
  slug: string;
  icon: string | null;
}

export interface HomeDepartment {
  codigo: string;
  nombre: string;
  totalTiendas: number;
}

export interface HomeTilesData {
  stores: HomeStore[];        // tiendas destacadas con logo
  categories: HomeCategory[]; // categorías top-level
  departments: HomeDepartment[]; // top departamentos por densidad
}

export async function getHomeTiles(): Promise<HomeTilesData> {
  const sb = getSupabaseServer();
  if (!isSupabaseConfigured || !sb) {
    return { stores: [], categories: [], departments: [] };
  }

  // Stores destacadas: random offset entre las primeras N activas con logo
  const POOL = 4000;
  const limit = 6;
  const offset = Math.floor(Math.random() * Math.max(1, POOL - limit * 4));
  const { data: storesRaw } = await sb
    .from('store')
    .select(
      'id, store_name, logo_url, banner_url, address:address_id!inner(state, city)',
    )
    .eq('is_active', true)
    .not('logo_url', 'is', null)
    .order('id', { ascending: false })
    .range(offset, offset + limit * 5 - 1);

  const stores: HomeStore[] = [];
  for (const s of (storesRaw ?? []) as any[]) {
    const stateName = s.address?.state ?? null;
    const codigo = stateName ? stateNameToCodigo(stateName) : null;
    if (!codigo) continue;
    stores.push({
      id: String(s.id),
      nombre: s.store_name ?? 'Tienda',
      logoUrl: s.logo_url ?? null,
      bannerUrl: s.banner_url ?? null,
      ciudad: s.address?.city ?? null,
      departamentoCodigo: codigo,
      departamentoNombre: nombreDepartamento(codigo),
    });
    if (stores.length >= limit) break;
  }

  // Categorías top-level (parent_id null)
  const { data: catsRaw } = await sb
    .from('general_category')
    .select('id, name, slug, icon')
    .is('parent_id', null)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(8);
  const categories: HomeCategory[] = (catsRaw ?? []).map((c: any) => ({
    id: Number(c.id),
    nombre: c.name,
    slug: c.slug,
    icon: c.icon ?? null,
  }));

  // Top departamentos por densidad
  const counts = await getTiendaCountByDepartamento();
  const departments: HomeDepartment[] = Object.entries(counts)
    .map(([codigo, totalTiendas]) => ({
      codigo,
      nombre: nombreDepartamento(codigo),
      totalTiendas: totalTiendas as number,
    }))
    .sort((a, b) => b.totalTiendas - a.totalTiendas)
    .slice(0, 6);

  return { stores, categories, departments };
}
