import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';

export interface ColombiaDepartmentProps {
  DPTO_CCDGO: string;
  DPTO_CNMBR: string;
  totalTiendas?: number;
}

export type ColombiaGeoJSON = FeatureCollection<
  Polygon | MultiPolygon,
  ColombiaDepartmentProps
>;
