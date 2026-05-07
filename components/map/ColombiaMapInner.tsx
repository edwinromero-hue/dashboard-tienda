'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, {
  Layer,
  NavigationControl,
  Source,
  type MapLayerMouseEvent,
  type MapRef,
  type LayerProps,
} from 'react-map-gl/maplibre';
import { motion } from 'framer-motion';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import {
  loadColombiaGeoJSON,
  loadColombiaMunicipalities,
  municipalitiesByDept,
  featureBbox,
  type MunicipalitiesGeoJSON,
} from '@/lib/geo/colombia-departments';
import { nombreDepartamento } from '@/lib/geo/department-codes';
import { mpioToDbCity, prettyMunicipality } from '@/lib/geo/municipality-aliases';
import { api } from '@/lib/api/client';
import type { ColombiaGeoJSON } from '@/types/geo';
import { MapLegend } from './MapLegend';
import { MapTooltip } from './MapTooltip';
import { IdleOverlay } from '@/components/idle/IdleOverlay';
import { useIdleStore } from '@/lib/store/useIdleStore';

const COLOMBIA_VIEW = {
  longitude: -74.0721,
  latitude: 4.7110,
  zoom: 5.1,
};

const DEPT_SOURCE = 'departments';
const DEPT_FILL = 'departments-fill';
const DEPT_LINE = 'departments-border';
const DEPT_LABEL = 'departments-label';
const DEPT_SELECTED_LINE = 'departments-border-selected';

const MUN_SOURCE = 'municipalities';
const MUN_FILL = 'municipalities-fill';
const MUN_LINE = 'municipalities-border';
const MUN_LABEL = 'municipalities-label';
const MUN_SELECTED_LINE = 'municipalities-border-selected';

export default function ColombiaMapInner() {
  const mapRef = useRef<MapRef | null>(null);
  const [geo, setGeo] = useState<ColombiaGeoJSON | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [munGeo, setMunGeo] = useState<MunicipalitiesGeoJSON | null>(null);
  const [munCounts, setMunCounts] = useState<Record<string, number>>({});
  const [hoverInfo, setHoverInfo] = useState<{
    longitude: number;
    latitude: number;
    nombre: string;
    total: number;
  } | null>(null);
  const previousHoverRef = useRef<{ source: string; id: string | number } | null>(null);

  const selectedDepartamento = useDashboardStore((s) => s.selectedDepartamentoCodigo);
  const selectedMunicipio = useDashboardStore((s) => s.selectedMunicipioName);
  const selectDepartamento = useDashboardStore((s) => s.selectDepartamento);
  const selectMunicipio = useDashboardStore((s) => s.selectMunicipio);
  const idle = useIdleStore((s) => s.idle);

  const inDeptView = !selectedDepartamento;

  // Cargar GeoJSON de departamentos + counts
  useEffect(() => {
    let cancelled = false;
    Promise.all([loadColombiaGeoJSON(), api.tiendaCounts().catch(() => ({}))]).then(
      ([g, c]) => {
        if (cancelled) return;
        setGeo(g);
        setCounts(c as Record<string, number>);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  // Cargar municipios + counts cuando se selecciona un depto
  useEffect(() => {
    if (!selectedDepartamento) {
      setMunGeo(null);
      setMunCounts({});
      return;
    }
    let cancelled = false;
    Promise.all([
      loadColombiaMunicipalities(),
      api.municipioCounts(selectedDepartamento).catch(() => ({})),
    ]).then(([m, c]) => {
      if (cancelled) return;
      setMunGeo(municipalitiesByDept(m, selectedDepartamento));
      setMunCounts(c as Record<string, number>);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedDepartamento]);

  const maxCount = useMemo(() => {
    const values = Object.values(counts);
    return values.length ? Math.max(...values) : 0;
  }, [counts]);

  const munMaxCount = useMemo(() => {
    const values = Object.values(munCounts);
    return values.length ? Math.max(...values) : 0;
  }, [munCounts]);

  // Mergear counts en el GeoJSON departamental
  const dataWithCounts = useMemo<ColombiaGeoJSON | null>(() => {
    if (!geo) return null;
    return {
      type: 'FeatureCollection',
      features: geo.features.map((f) => ({
        ...f,
        properties: {
          ...f.properties,
          totalTiendas: counts[f.properties.DPTO_CCDGO] ?? 0,
        },
      })),
    };
  }, [geo, counts]);

  // Mergear counts en el GeoJSON municipal
  const munWithCounts = useMemo<MunicipalitiesGeoJSON | null>(() => {
    if (!munGeo) return null;
    return {
      type: 'FeatureCollection',
      features: munGeo.features.map((f) => ({
        ...f,
        properties: {
          ...f.properties,
          totalTiendas: munCounts[mpioToDbCity(f.properties.MPIO_CNMBR)] ?? 0,
        } as any,
      })),
    };
  }, [munGeo, munCounts]);

  // Volar al departamento seleccionado (o a Colombia si se deselecciona)
  useEffect(() => {
    if (!geo || !mapRef.current) return;
    if (!selectedDepartamento) {
      mapRef.current.flyTo({
        center: [COLOMBIA_VIEW.longitude, COLOMBIA_VIEW.latitude],
        zoom: COLOMBIA_VIEW.zoom,
        duration: 800,
      });
      return;
    }
    const feature = geo.features.find(
      (f) => f.properties.DPTO_CCDGO === selectedDepartamento,
    );
    if (!feature) return;
    const [minLng, minLat, maxLng, maxLat] = featureBbox(feature);
    mapRef.current.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 80, duration: 900 },
    );
  }, [selectedDepartamento, geo]);

  const onHover = useCallback(
    (event: MapLayerMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (!map) return;
      const feature = event.features?.[0];

      // Reset previous hover
      if (previousHoverRef.current) {
        const prev = previousHoverRef.current;
        if (!feature || prev.id !== feature.id || prev.source !== feature.source) {
          map.setFeatureState(
            { source: prev.source, id: prev.id },
            { hover: false },
          );
        }
      }

      if (feature && feature.id != null && feature.source) {
        map.setFeatureState(
          { source: feature.source, id: feature.id },
          { hover: true },
        );
        previousHoverRef.current = { source: feature.source, id: feature.id };
        const props = feature.properties as any;
        if (feature.source === MUN_SOURCE) {
          setHoverInfo({
            longitude: event.lngLat.lng,
            latitude: event.lngLat.lat,
            nombre: prettyMunicipality(props.MPIO_CNMBR),
            total: munCounts[mpioToDbCity(props.MPIO_CNMBR)] ?? 0,
          });
        } else {
          setHoverInfo({
            longitude: event.lngLat.lng,
            latitude: event.lngLat.lat,
            nombre: nombreDepartamento(props.DPTO_CCDGO),
            total: counts[props.DPTO_CCDGO] ?? 0,
          });
        }
      } else {
        setHoverInfo(null);
      }
    },
    [counts, munCounts],
  );

  const onMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map && previousHoverRef.current) {
      map.setFeatureState(
        { source: previousHoverRef.current.source, id: previousHoverRef.current.id },
        { hover: false },
      );
      previousHoverRef.current = null;
    }
    setHoverInfo(null);
  }, []);

  const onClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;
      const props = feature.properties as any;
      if (feature.source === MUN_SOURCE) {
        // Click en municipio: lo seleccionamos
        const mpio = props.MPIO_CNMBR;
        if (mpio) selectMunicipio(mpio);
      } else if (feature.source === DEPT_SOURCE) {
        // Click en departamento: solo aplica si todavía no hay depto seleccionado
        const codigo = props.DPTO_CCDGO;
        if (codigo) selectDepartamento(codigo);
      }
    },
    [selectDepartamento, selectMunicipio],
  );

  // === Capas DEPARTAMENTOS ===
  const deptFill: LayerProps = {
    id: DEPT_FILL,
    type: 'fill',
    source: DEPT_SOURCE,
    paint: {
      'fill-color': inDeptView
        ? [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'totalTiendas'], 0],
            0, '#f1f5f9',
            1, '#e3f4d2',
            Math.max(2, Math.ceil(maxCount * 0.25)), '#a8d863',
            Math.max(3, Math.ceil(maxCount * 0.5)), '#7ab83c',
            Math.max(4, Math.ceil(maxCount * 0.75)), '#3f7e1f',
            Math.max(5, maxCount || 5), '#1e5b2a',
          ]
        : '#cbd5e1',
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        inDeptView ? 0.92 : 0.25,
        inDeptView ? 0.78 : 0.18,
      ],
    },
  };

  const deptLine: LayerProps = {
    id: DEPT_LINE,
    type: 'line',
    source: DEPT_SOURCE,
    paint: {
      'line-color': '#94a3b8',
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        1.8,
        0.8,
      ],
    },
  };

  const deptSelectedLine: LayerProps = {
    id: DEPT_SELECTED_LINE,
    type: 'line',
    source: DEPT_SOURCE,
    filter: ['==', ['get', 'DPTO_CCDGO'], selectedDepartamento ?? '__none__'],
    paint: {
      'line-color': '#1e5b2a',
      'line-width': 2.6,
    },
  };

  const deptLabel: LayerProps = {
    id: DEPT_LABEL,
    type: 'symbol',
    source: DEPT_SOURCE,
    minzoom: 6,
    layout: {
      'text-field': ['get', 'DPTO_CNMBR'],
      'text-size': 11,
      'text-anchor': 'center',
      'text-allow-overlap': false,
    },
    paint: {
      'text-color': '#1e293b',
      'text-halo-color': '#ffffff',
      'text-halo-width': 1.4,
    },
  };

  // === Capas MUNICIPIOS ===
  const munFill: LayerProps = {
    id: MUN_FILL,
    type: 'fill',
    source: MUN_SOURCE,
    paint: {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['coalesce', ['get', 'totalTiendas'], 0],
        0, '#fafaf6',
        1, '#e3f4d2',
        Math.max(2, Math.ceil(munMaxCount * 0.25)), '#a8d863',
        Math.max(3, Math.ceil(munMaxCount * 0.5)), '#7ab83c',
        Math.max(4, Math.ceil(munMaxCount * 0.75)), '#3f7e1f',
        Math.max(5, munMaxCount || 5), '#1e5b2a',
      ],
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.92,
        0.78,
      ],
    },
  };

  const munLine: LayerProps = {
    id: MUN_LINE,
    type: 'line',
    source: MUN_SOURCE,
    paint: {
      'line-color': '#475569',
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        1.6,
        0.5,
      ],
    },
  };

  const munSelectedLine: LayerProps = {
    id: MUN_SELECTED_LINE,
    type: 'line',
    source: MUN_SOURCE,
    filter: ['==', ['get', 'MPIO_CNMBR'], selectedMunicipio ?? '__none__'],
    paint: {
      'line-color': '#1e5b2a',
      'line-width': 3,
    },
  };

  const munLabel: LayerProps = {
    id: MUN_LABEL,
    type: 'symbol',
    source: MUN_SOURCE,
    minzoom: 8,
    layout: {
      'text-field': ['get', 'MPIO_CNMBR'],
      'text-size': 10,
      'text-anchor': 'center',
      'text-allow-overlap': false,
    },
    paint: {
      'text-color': '#1e293b',
      'text-halo-color': '#ffffff',
      'text-halo-width': 1.4,
    },
  };

  if (!dataWithCounts) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-full w-full items-center justify-center bg-brand-100"
      >
        <div className="shimmer-bg h-full w-full" />
      </motion.div>
    );
  }

  // Solo es interactiva la capa relevante: deptos cuando no hay selección,
  // municipios cuando hay un depto seleccionado.
  const interactiveLayerIds = inDeptView ? [DEPT_FILL] : [MUN_FILL];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative h-full w-full"
    >
      <Map
        ref={mapRef}
        initialViewState={COLOMBIA_VIEW}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        interactiveLayerIds={interactiveLayerIds}
        cursor={hoverInfo ? 'pointer' : 'grab'}
        onMouseMove={onHover}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-left" showCompass={false} />

        <Source
          id={DEPT_SOURCE}
          type="geojson"
          data={dataWithCounts as any}
          promoteId="DPTO_CCDGO"
        >
          <Layer {...deptFill} />
          <Layer {...deptLine} />
          <Layer {...deptSelectedLine} />
          {inDeptView && <Layer {...deptLabel} />}
        </Source>

        {munWithCounts && (
          <Source
            id={MUN_SOURCE}
            type="geojson"
            data={munWithCounts as any}
            promoteId="MPIO_CCDGO"
          >
            <Layer {...munFill} />
            <Layer {...munLine} />
            <Layer {...munSelectedLine} />
            <Layer {...munLabel} />
          </Source>
        )}

        {hoverInfo && (
          <MapTooltip
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            nombre={hoverInfo.nombre}
            totalTiendas={hoverInfo.total}
          />
        )}
      </Map>

      {!idle && <MapLegend max={inDeptView ? maxCount : munMaxCount} />}

      <IdleOverlay mapRef={mapRef} />
    </motion.div>
  );
}
