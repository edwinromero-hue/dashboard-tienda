import type { Tienda, Producto, CategoryStat } from '@/types/domain';
import type { FeaturedProduct } from './featured';
import { nombreDepartamento } from '@/lib/geo/department-codes';

// Imagen de placeholder con seed estable (cacheable y determinista).
const img = (seed: string) => `https://picsum.photos/seed/${seed}/480/480`;

type MockTienda = {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string | null;
  city: string;
  logoUrl: string | null;
};

const TIENDAS_BY_DEPT: Record<string, MockTienda[]> = {
  '11': [
    { id: 't-bog-01', nombre: 'Tienda Chapinero', direccion: 'Cl. 60 #7-22, Bogotá', telefono: '+57 1 555 0101', city: 'Bogotá', logoUrl: img('logo-bog-01') },
    { id: 't-bog-02', nombre: 'Mercado Usaquén', direccion: 'Cra. 7 #119-30, Bogotá', telefono: '+57 1 555 0102', city: 'Bogotá', logoUrl: img('logo-bog-02') },
    { id: 't-bog-03', nombre: 'Punto Centro', direccion: 'Cl. 19 #4-50, Bogotá', telefono: '+57 1 555 0103', city: 'Bogotá', logoUrl: img('logo-bog-03') },
    { id: 't-bog-04', nombre: 'Tienda Cedritos', direccion: 'Cra. 11 #138-25, Bogotá', telefono: '+57 1 555 0104', city: 'Bogotá', logoUrl: img('logo-bog-04') },
  ],
  '05': [
    { id: 't-ant-01', nombre: 'Mercado El Poblado', direccion: 'Cra. 43A #6-15, Medellín', telefono: '+57 4 555 0201', city: 'Medellín', logoUrl: img('logo-ant-01') },
    { id: 't-ant-02', nombre: 'Tienda Laureles', direccion: 'Cl. 33 #80-22, Medellín', telefono: '+57 4 555 0202', city: 'Medellín', logoUrl: img('logo-ant-02') },
    { id: 't-ant-03', nombre: 'Punto Envigado', direccion: 'Cra. 48 #38-55, Envigado', telefono: '+57 4 555 0203', city: 'Envigado', logoUrl: img('logo-ant-03') },
  ],
  '76': [
    { id: 't-vlc-01', nombre: 'Tienda Granada', direccion: 'Av. 9N #15-44, Cali', telefono: '+57 2 555 0301', city: 'Cali', logoUrl: img('logo-vlc-01') },
    { id: 't-vlc-02', nombre: 'Mercado San Fernando', direccion: 'Cl. 5 #34-12, Cali', telefono: '+57 2 555 0302', city: 'Cali', logoUrl: img('logo-vlc-02') },
  ],
  '08': [
    { id: 't-atl-01', nombre: 'Tienda Alto Prado', direccion: 'Cra. 53 #76-30, Barranquilla', telefono: '+57 5 555 0401', city: 'Barranquilla', logoUrl: img('logo-atl-01') },
    { id: 't-atl-02', nombre: 'Punto Norte', direccion: 'Cl. 84 #51-40, Barranquilla', telefono: '+57 5 555 0402', city: 'Barranquilla', logoUrl: img('logo-atl-02') },
  ],
  '13': [
    { id: 't-bol-01', nombre: 'Tienda Bocagrande', direccion: 'Av. San Martín, Cartagena', telefono: '+57 5 555 0501', city: 'Cartagena', logoUrl: img('logo-bol-01') },
  ],
  '17': [
    { id: 't-cal-01', nombre: 'Mercado Manizales Centro', direccion: 'Cra. 23 #20-45, Manizales', telefono: '+57 6 555 0601', city: 'Manizales', logoUrl: img('logo-cal-01') },
  ],
  '66': [
    { id: 't-ris-01', nombre: 'Tienda Pereira', direccion: 'Cra. 7 #18-25, Pereira', telefono: '+57 6 555 0701', city: 'Pereira', logoUrl: img('logo-ris-01') },
  ],
  '68': [
    { id: 't-san-01', nombre: 'Tienda Cabecera', direccion: 'Cra. 35 #48-10, Bucaramanga', telefono: '+57 7 555 0801', city: 'Bucaramanga', logoUrl: img('logo-san-01') },
    { id: 't-san-02', nombre: 'Punto San Pío', direccion: 'Cl. 45 #29-50, Bucaramanga', telefono: '+57 7 555 0802', city: 'Bucaramanga', logoUrl: img('logo-san-02') },
  ],
  '73': [
    { id: 't-tol-01', nombre: 'Mercado Ibagué', direccion: 'Cra. 5 #37-22, Ibagué', telefono: '+57 8 555 0901', city: 'Ibagué', logoUrl: img('logo-tol-01') },
  ],
  '50': [
    { id: 't-met-01', nombre: 'Tienda Villavicencio', direccion: 'Cl. 38 #30-15, Villavicencio', telefono: '+57 8 555 1001', city: 'Villavicencio', logoUrl: img('logo-met-01') },
  ],
};

// === Catálogo maestro de 50 productos ficticios típicos del retail colombiano ===
interface CatalogProduct {
  id: number;
  nombre: string;
  precio: number;          // COP
  comparePrecio: number | null;
  categoriaId: number;
}

const CATEGORIAS_DEF = [
  { id: 1, nombre: 'Lácteos' },
  { id: 2, nombre: 'Panadería' },
  { id: 3, nombre: 'Bebidas' },
  { id: 4, nombre: 'Snacks' },
  { id: 5, nombre: 'Confitería' },
  { id: 6, nombre: 'Frutas' },
  { id: 7, nombre: 'Verduras' },
  { id: 8, nombre: 'Carnes' },
  { id: 9, nombre: 'Embutidos' },
  { id: 10, nombre: 'Granos' },
  { id: 11, nombre: 'Aseo' },
  { id: 12, nombre: 'Cuidado Personal' },
] as const;

const CATEGORIA_BY_ID = new Map<number, string>(
  CATEGORIAS_DEF.map((c) => [c.id, c.nombre]),
);

const PRODUCT_CATALOG: CatalogProduct[] = [
  // Lácteos (1)
  { id: 1, nombre: 'Leche entera Alquería 1L', precio: 4900, comparePrecio: 5800, categoriaId: 1 },
  { id: 2, nombre: 'Yogurt griego Alpina 150g', precio: 3200, comparePrecio: null, categoriaId: 1 },
  { id: 3, nombre: 'Queso campesino 250g', precio: 8500, comparePrecio: null, categoriaId: 1 },
  { id: 4, nombre: 'Mantequilla Colanta 250g', precio: 7800, comparePrecio: 9200, categoriaId: 1 },
  { id: 5, nombre: 'Arequipe Alpina 250g', precio: 6500, comparePrecio: null, categoriaId: 1 },
  // Panadería (2)
  { id: 6, nombre: 'Pan tajado Bimbo', precio: 5400, comparePrecio: null, categoriaId: 2 },
  { id: 7, nombre: 'Pan integral Bimbo', precio: 6200, comparePrecio: 7100, categoriaId: 2 },
  { id: 8, nombre: 'Tortillas mexicanas x10', precio: 7900, comparePrecio: null, categoriaId: 2 },
  { id: 9, nombre: 'Croissant artesanal', precio: 3500, comparePrecio: null, categoriaId: 2 },
  { id: 10, nombre: 'Galletas Saltinas Noel', precio: 4200, comparePrecio: null, categoriaId: 2 },
  // Bebidas (3)
  { id: 11, nombre: 'Coca-Cola 1.5L', precio: 5500, comparePrecio: 6500, categoriaId: 3 },
  { id: 12, nombre: 'Hatsu Té Verde 400ml', precio: 4800, comparePrecio: null, categoriaId: 3 },
  { id: 13, nombre: 'Postobón Manzana 2L', precio: 6300, comparePrecio: null, categoriaId: 3 },
  { id: 14, nombre: 'Agua Cristal 1L', precio: 2500, comparePrecio: null, categoriaId: 3 },
  { id: 15, nombre: 'Jugo Hit Maracuyá 1.5L', precio: 3800, comparePrecio: 4500, categoriaId: 3 },
  { id: 16, nombre: 'Pony Malta 330ml', precio: 2900, comparePrecio: null, categoriaId: 3 },
  { id: 17, nombre: 'Aguardiente Antioqueño 750ml', precio: 32000, comparePrecio: 38000, categoriaId: 3 },
  { id: 18, nombre: 'Café Juan Valdez molido 250g', precio: 18500, comparePrecio: null, categoriaId: 3 },
  // Snacks (4)
  { id: 19, nombre: 'Papas Margarita Limón 105g', precio: 3200, comparePrecio: null, categoriaId: 4 },
  { id: 20, nombre: 'Chocoramo individual', precio: 1800, comparePrecio: null, categoriaId: 4 },
  { id: 21, nombre: 'Bocadillo veleño 250g', precio: 2500, comparePrecio: null, categoriaId: 4 },
  { id: 22, nombre: 'Plátanos chips Natuchips', precio: 4500, comparePrecio: 5200, categoriaId: 4 },
  { id: 23, nombre: 'Maní salado Manimoto 100g', precio: 3800, comparePrecio: null, categoriaId: 4 },
  // Confitería (5)
  { id: 24, nombre: 'Chocolatina Jet x6', precio: 1500, comparePrecio: null, categoriaId: 5 },
  { id: 25, nombre: 'Bon Bon Bum unidad', precio: 800, comparePrecio: null, categoriaId: 5 },
  { id: 26, nombre: 'Brownie Ramo', precio: 2200, comparePrecio: null, categoriaId: 5 },
  { id: 27, nombre: 'Manjar blanco 200g', precio: 5800, comparePrecio: 6800, categoriaId: 5 },
  // Frutas (6)
  { id: 28, nombre: 'Banano (kg)', precio: 3500, comparePrecio: null, categoriaId: 6 },
  { id: 29, nombre: 'Manzana roja importada (kg)', precio: 6900, comparePrecio: null, categoriaId: 6 },
  { id: 30, nombre: 'Aguacate Hass unidad', precio: 3500, comparePrecio: 4200, categoriaId: 6 },
  { id: 31, nombre: 'Mango Tommy (kg)', precio: 4800, comparePrecio: null, categoriaId: 6 },
  { id: 32, nombre: 'Naranja Valencia (kg)', precio: 3200, comparePrecio: null, categoriaId: 6 },
  // Verduras (7)
  { id: 33, nombre: 'Tomate chonto (kg)', precio: 4200, comparePrecio: null, categoriaId: 7 },
  { id: 34, nombre: 'Cebolla cabezona (kg)', precio: 3500, comparePrecio: null, categoriaId: 7 },
  { id: 35, nombre: 'Papa criolla (kg)', precio: 5200, comparePrecio: 6000, categoriaId: 7 },
  { id: 36, nombre: 'Lechuga crespa unidad', precio: 2800, comparePrecio: null, categoriaId: 7 },
  { id: 37, nombre: 'Zanahoria (kg)', precio: 2900, comparePrecio: null, categoriaId: 7 },
  // Carnes (8)
  { id: 38, nombre: 'Carne molida de res 500g', precio: 18500, comparePrecio: null, categoriaId: 8 },
  { id: 39, nombre: 'Pechuga de pollo 1kg', precio: 16800, comparePrecio: 19500, categoriaId: 8 },
  { id: 40, nombre: 'Costilla de cerdo 1kg', precio: 22500, comparePrecio: null, categoriaId: 8 },
  // Embutidos (9)
  { id: 41, nombre: 'Salchichón cervecero Zenú 250g', precio: 12500, comparePrecio: null, categoriaId: 9 },
  { id: 42, nombre: 'Jamón ahumado Pietrán 200g', precio: 14800, comparePrecio: 17000, categoriaId: 9 },
  { id: 43, nombre: 'Chorizo paisa x6', precio: 18900, comparePrecio: null, categoriaId: 9 },
  // Granos (10)
  { id: 44, nombre: 'Arroz Diana 1kg', precio: 4900, comparePrecio: null, categoriaId: 10 },
  { id: 45, nombre: 'Frijol cargamanto 1kg', precio: 7800, comparePrecio: 9100, categoriaId: 10 },
  { id: 46, nombre: 'Lentejas 500g', precio: 5200, comparePrecio: null, categoriaId: 10 },
  // Aseo (11)
  { id: 47, nombre: 'Detergente Fab Activo 1.8kg', precio: 18500, comparePrecio: 21500, categoriaId: 11 },
  { id: 48, nombre: 'Jabón en barra Rey x3', precio: 2900, comparePrecio: null, categoriaId: 11 },
  { id: 49, nombre: 'Papel higiénico Familia x12', precio: 22500, comparePrecio: 26900, categoriaId: 11 },
  // Cuidado Personal (12)
  { id: 50, nombre: 'Crema dental Colgate Triple 100ml', precio: 8200, comparePrecio: null, categoriaId: 12 },
];

const PRODUCT_BY_ID = new Map<number, CatalogProduct>(
  PRODUCT_CATALOG.map((p) => [p.id, p]),
);

// Hash determinista de string → entero, para asignar productos por tienda de
// forma estable (mismo `tiendaId` siempre da el mismo set).
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickProductIdsForTienda(tiendaId: string): number[] {
  const seed = hash(tiendaId);
  const total = PRODUCT_CATALOG.length;
  const count = 8 + (seed % 8); // 8–15 productos por tienda
  const step = 1 + (seed % 5);  // saltos coprimos para variar
  const offset = seed % total;
  const seen = new Set<number>();
  const out: number[] = [];
  for (let i = 0; out.length < count && i < total * 2; i++) {
    const idx = (offset + i * step) % total;
    const pid = PRODUCT_CATALOG[idx].id;
    if (seen.has(pid)) continue;
    seen.add(pid);
    out.push(pid);
  }
  return out;
}

// === Listados públicos consumidos por queries.ts/featured.ts ===

export const mockTiendaCountByDepartamento = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const [codigo, tiendas] of Object.entries(TIENDAS_BY_DEPT)) {
    counts[codigo] = tiendas.length;
  }
  return counts;
};

export const mockTiendasByDepartamento = (codigo: string): Tienda[] => {
  const list = TIENDAS_BY_DEPT[codigo] ?? [];
  return list.map((t) => ({
    id: t.id,
    nombre: t.nombre,
    direccion: t.direccion,
    telefono: t.telefono,
    departamentoCodigo: codigo,
    logoUrl: t.logoUrl,
    bannerUrl: null,
  }));
};

export const mockProductosByTienda = (tiendaId: string): Producto[] => {
  const ids = pickProductIdsForTienda(tiendaId);
  return ids.map((pid) => {
    const p = PRODUCT_BY_ID.get(pid)!;
    return {
      id: `${tiendaId}-${p.id}`,
      tiendaId,
      nombre: p.nombre,
      precio: p.precio,
      categoria: CATEGORIA_BY_ID.get(p.categoriaId) ?? 'Sin categoría',
      imagenUrl: img(`prod-${p.id}`),
    };
  });
};

export const mockCategoryBreakdown = (codigo: string): CategoryStat[] => {
  const tiendas = mockTiendasByDepartamento(codigo);
  if (tiendas.length === 0) return [];
  const counts = new Map<number, number>();
  for (const t of tiendas) {
    for (const pid of pickProductIdsForTienda(t.id)) {
      const cat = PRODUCT_BY_ID.get(pid)!.categoriaId;
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }
  }
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
  return Array.from(counts.entries())
    .map(([categoriaId, n]) => ({
      categoriaId,
      categoria: CATEGORIA_BY_ID.get(categoriaId) ?? 'Sin categoría',
      totalProductos: n,
      porcentaje: total ? (n / total) * 100 : 0,
    }))
    .sort((a, b) => b.totalProductos - a.totalProductos);
};

// IDs de tiendas (como string) en un depto que venden algún producto de la categoría.
export const mockStoreIdsByCategoria = (
  codigo: string,
  categoriaId: number,
): string[] => {
  const tiendas = TIENDAS_BY_DEPT[codigo] ?? [];
  const ids: string[] = [];
  for (const t of tiendas) {
    const pids = pickProductIdsForTienda(t.id);
    if (pids.some((pid) => PRODUCT_BY_ID.get(pid)!.categoriaId === categoriaId)) {
      ids.push(t.id);
    }
  }
  return ids;
};

// Conteo de tiendas por municipio (city) dentro de un depto.
export const mockTiendaCountByMunicipio = (
  codigo: string,
): Record<string, number> => {
  const tiendas = TIENDAS_BY_DEPT[codigo] ?? [];
  const counts: Record<string, number> = {};
  for (const t of tiendas) {
    const key = t.city.toUpperCase();
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
};

// Productos destacados con metadata de tienda + departamento.
// Se aplican filtros geográficos opcionales y se mezclan al azar.
export const mockFeaturedProducts = (
  limit: number,
  filters: { departamentoCodigo?: string | null; municipioMpioName?: string | null } = {},
): FeaturedProduct[] => {
  const deptos = filters.departamentoCodigo
    ? [filters.departamentoCodigo]
    : Object.keys(TIENDAS_BY_DEPT);

  const muniNorm = filters.municipioMpioName
    ? filters.municipioMpioName.toUpperCase()
    : null;

  const pool: FeaturedProduct[] = [];
  for (const codigo of deptos) {
    const tiendas = TIENDAS_BY_DEPT[codigo] ?? [];
    for (const t of tiendas) {
      if (muniNorm && t.city.toUpperCase() !== muniNorm) continue;
      for (const pid of pickProductIdsForTienda(t.id)) {
        const p = PRODUCT_BY_ID.get(pid)!;
        pool.push({
          id: `${t.id}-${p.id}`,
          nombre: p.nombre,
          precio: p.precio,
          comparePrecio: p.comparePrecio,
          categoria: CATEGORIA_BY_ID.get(p.categoriaId) ?? null,
          imagenUrl: img(`prod-${p.id}`),
          tiendaId: t.id,
          tiendaNombre: t.nombre,
          tiendaLogo: t.logoUrl,
          departamentoCodigo: codigo,
          departamentoNombre: nombreDepartamento(codigo),
          city: t.city,
        });
      }
    }
  }

  // Shuffle estilo Fisher-Yates
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, limit);
};
