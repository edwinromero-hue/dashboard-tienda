import type { Tienda, Producto, CategoryStat } from '@/types/domain';

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

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  tiendaCounts: () =>
    fetchJson<{ counts: Record<string, number> }>('/api/tienda-counts').then((r) => r.counts),
  tiendasByDepartamento: (codigo: string, municipio?: string | null) => {
    const params = new URLSearchParams({ departamento: codigo });
    if (municipio) params.set('municipio', municipio);
    return fetchJson<{ tiendas: Tienda[] }>(`/api/tiendas?${params}`).then((r) => r.tiendas);
  },
  municipioCounts: (codigo: string) =>
    fetchJson<{ counts: Record<string, number> }>(
      `/api/municipio-counts?departamento=${encodeURIComponent(codigo)}`,
    ).then((r) => r.counts),
  productosByTienda: (tiendaId: string) =>
    fetchJson<{ productos: Producto[] }>(`/api/productos?tienda=${encodeURIComponent(tiendaId)}`).then(
      (r) => r.productos,
    ),
  breakdownByDepartamento: (codigo: string) =>
    fetchJson<{ breakdown: CategoryStat[] }>(
      `/api/breakdown?departamento=${encodeURIComponent(codigo)}`,
    ).then((r) => r.breakdown),
  storeIdsByCategoria: (codigo: string, categoriaId: number) =>
    fetchJson<{ storeIds: string[] }>(
      `/api/store-ids-by-category?departamento=${encodeURIComponent(codigo)}&categoria=${categoriaId}`,
    ).then((r) => new Set(r.storeIds)),
  featured: (
    limit = 6,
    filters: { departamento?: string | null; municipio?: string | null } = {},
  ) => {
    const p = new URLSearchParams({ limit: String(limit) });
    if (filters.departamento) p.set('departamento', filters.departamento);
    if (filters.municipio) p.set('municipio', filters.municipio);
    return fetchJson<{ items: FeaturedProduct[] }>(`/api/featured?${p}`).then((r) => r.items);
  },
  homeTiles: () => fetchJson<HomeTilesData>('/api/home-tiles'),
};

export interface HomeTilesData {
  stores: {
    id: string;
    nombre: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    ciudad: string | null;
    departamentoCodigo: string | null;
    departamentoNombre: string;
  }[];
  categories: { id: number; nombre: string; slug: string; icon: string | null }[];
  departments: { codigo: string; nombre: string; totalTiendas: number }[];
}
