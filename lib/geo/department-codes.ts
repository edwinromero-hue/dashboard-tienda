// Códigos DANE → nombre del departamento (extraído del GeoJSON oficial).
// El campo `address.state` en Supabase guarda el nombre en MAYÚSCULAS con acentos
// (ej. "BOGOTÁ, D.C.", "ANTIOQUIA"). Mapeamos al código DPTO_CCDGO del mapa.

export const DEPARTAMENTO_NOMBRES: Record<string, string> = {
  '05': 'Antioquia',
  '08': 'Atlántico',
  '11': 'Bogotá D.C.',
  '13': 'Bolívar',
  '15': 'Boyacá',
  '17': 'Caldas',
  '18': 'Caquetá',
  '19': 'Cauca',
  '20': 'Cesar',
  '23': 'Córdoba',
  '25': 'Cundinamarca',
  '27': 'Chocó',
  '41': 'Huila',
  '44': 'La Guajira',
  '47': 'Magdalena',
  '50': 'Meta',
  '52': 'Nariño',
  '54': 'Norte de Santander',
  '63': 'Quindío',
  '66': 'Risaralda',
  '68': 'Santander',
  '70': 'Sucre',
  '73': 'Tolima',
  '76': 'Valle del Cauca',
  '81': 'Arauca',
  '85': 'Casanare',
  '86': 'Putumayo',
  '88': 'San Andrés y Providencia',
  '91': 'Amazonas',
  '94': 'Guainía',
  '95': 'Guaviare',
  '97': 'Vaupés',
  '99': 'Vichada',
};

// Normaliza: quita acentos, puntuación, espacios, "DC", y pasa a UPPERCASE.
function normalize(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[.,]/g, '')
    .replace(/\bD\s*C\b/gi, 'DC')
    .replace(/SANTAFE\s+DE\s+/gi, '')
    .replace(/ARCHIPIELAGO\s+DE\s+/gi, '')
    .replace(/\s+Y\s+SANTA\s+CATALINA/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

// Mapping: nombre normalizado → DPTO_CCDGO
const NAME_TO_CODE: Record<string, string> = {};
for (const [codigo, nombre] of Object.entries(DEPARTAMENTO_NOMBRES)) {
  NAME_TO_CODE[normalize(nombre)] = codigo;
}
// Aliases adicionales para variantes que aparecen en address.state
const ALIASES: Record<string, string> = {
  'BOGOTA': '11',
  'BOGOTA DC': '11',
  'BOGOTA DISTRITO CAPITAL': '11',
  'SAN ANDRES PROVIDENCIA': '88',
  'SAN ANDRES': '88',
};
Object.assign(NAME_TO_CODE, ALIASES);

export function nombreDepartamento(codigo: string | null | undefined): string {
  if (!codigo) return '';
  return DEPARTAMENTO_NOMBRES[codigo] ?? codigo;
}

// Convierte el nombre que viene de Supabase (address.state) → DPTO_CCDGO
export function stateNameToCodigo(state: string | null | undefined): string | null {
  if (!state) return null;
  return NAME_TO_CODE[normalize(state)] ?? null;
}

// Devuelve el state name canónico (uppercase con acentos) para un código,
// usado al consultar Supabase con .eq('state', ...).
export const CODE_TO_DB_STATE: Record<string, string> = {
  '05': 'ANTIOQUIA',
  '08': 'ATLÁNTICO',
  '11': 'BOGOTÁ, D.C.',
  '13': 'BOLÍVAR',
  '15': 'BOYACÁ',
  '17': 'CALDAS',
  '18': 'CAQUETÁ',
  '19': 'CAUCA',
  '20': 'CESAR',
  '23': 'CÓRDOBA',
  '25': 'CUNDINAMARCA',
  '27': 'CHOCÓ',
  '41': 'HUILA',
  '44': 'LA GUAJIRA',
  '47': 'MAGDALENA',
  '50': 'META',
  '52': 'NARIÑO',
  '54': 'NORTE DE SANTANDER',
  '63': 'QUINDÍO',
  '66': 'RISARALDA',
  '68': 'SANTANDER',
  '70': 'SUCRE',
  '73': 'TOLIMA',
  '76': 'VALLE DEL CAUCA',
  '81': 'ARAUCA',
  '85': 'CASANARE',
  '86': 'PUTUMAYO',
  '88': 'SAN ANDRÉS Y PROVIDENCIA',
  '91': 'AMAZONAS',
  '94': 'GUAINÍA',
  '95': 'GUAVIARE',
  '97': 'VAUPÉS',
  '99': 'VICHADA',
};
