// MPIO_CNMBR (GeoJSON) → address.city (Supabase)
// Solo se listan los casos en que difieren. Si no está aquí se usa el mismo nombre.
const MPIO_TO_DB_CITY: Record<string, string> = {
  CALI: 'SANTIAGO DE CALI',
};

export function mpioToDbCity(mpioName: string): string {
  return MPIO_TO_DB_CITY[mpioName] ?? mpioName;
}

// Display amigable: "BOGOTÁ, D.C." → "Bogotá D.C.", "SANTIAGO DE CALI" → "Santiago de Cali"
export function prettyMunicipality(mpioName: string): string {
  return mpioName
    .toLowerCase()
    .split(' ')
    .map((w) => {
      if (w.length <= 2 && w !== 'sf') return w; // de, la, y
      return w[0].toUpperCase() + w.slice(1);
    })
    .join(' ')
    .replace(/d\.c\./i, 'D.C.')
    .replace(/, d\.c\./i, ' D.C.');
}
