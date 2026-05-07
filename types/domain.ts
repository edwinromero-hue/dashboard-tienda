export type DepartamentoCodigo = string;

export interface Departamento {
  codigo: DepartamentoCodigo;
  nombre: string;
  totalTiendas: number;
}

export interface Tienda {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string | null;
  departamentoCodigo: DepartamentoCodigo;
  logoUrl: string | null;
  bannerUrl: string | null;
}

export interface Producto {
  id: string;
  tiendaId: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagenUrl: string | null;
}

export interface CategoryStat {
  categoriaId: number;
  categoria: string;
  totalProductos: number;
  porcentaje: number;
}

export type DashboardView = 'map' | 'products';
