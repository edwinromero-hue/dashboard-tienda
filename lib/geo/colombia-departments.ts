import type { ColombiaGeoJSON } from '@/types/geo';
import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson';

let cached: ColombiaGeoJSON | null = null;
let pending: Promise<ColombiaGeoJSON> | null = null;

export async function loadColombiaGeoJSON(): Promise<ColombiaGeoJSON> {
  if (cached) return cached;
  if (pending) return pending;
  pending = fetch('/data/colombia-departments.geojson')
    .then((r) => {
      if (!r.ok) throw new Error(`GeoJSON HTTP ${r.status}`);
      return r.json();
    })
    .then((data: ColombiaGeoJSON) => {
      cached = data;
      pending = null;
      return data;
    });
  return pending;
}

// Municipios — properties: DPTO_CCDGO, MPIO_CCDGO (5-digit), MPIO_CNMBR, DPTO_CNMBR
export interface MunicipalityProps {
  DPTO_CCDGO: string;
  MPIO_CCDGO: string;
  MPIO_CNMBR: string;
  DPTO_CNMBR: string;
}
export type MunicipalitiesGeoJSON = FeatureCollection<Polygon | MultiPolygon, MunicipalityProps>;

let munCached: MunicipalitiesGeoJSON | null = null;
let munPending: Promise<MunicipalitiesGeoJSON> | null = null;

export async function loadColombiaMunicipalities(): Promise<MunicipalitiesGeoJSON> {
  if (munCached) return munCached;
  if (munPending) return munPending;
  munPending = fetch('/data/colombia-municipalities.geojson')
    .then((r) => {
      if (!r.ok) throw new Error(`Municipalities HTTP ${r.status}`);
      return r.json();
    })
    .then((data: MunicipalitiesGeoJSON) => {
      munCached = data;
      munPending = null;
      return data;
    });
  return munPending;
}

export function municipalitiesByDept(
  geo: MunicipalitiesGeoJSON,
  deptCodigo: string,
): MunicipalitiesGeoJSON {
  return {
    type: 'FeatureCollection',
    features: geo.features.filter((f) => f.properties.DPTO_CCDGO === deptCodigo),
  };
}

// Bbox de un Feature (Polygon | MultiPolygon)
export function featureBbox(feature: ColombiaGeoJSON['features'][number]): [number, number, number, number] {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  const visit = (coords: any) => {
    if (typeof coords[0] === 'number') {
      const [lng, lat] = coords;
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    } else {
      for (const c of coords) visit(c);
    }
  };
  visit(feature.geometry.coordinates);
  return [minLng, minLat, maxLng, maxLat];
}
