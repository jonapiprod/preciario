// Combina los search params actuales de la URL con overrides puntuales,
// para generar enlaces de filtro (categoría, tienda, orden...) sin perder
// el resto de filtros aplicados. Un valor `undefined` en overrides elimina
// esa clave (toggle de filtro).
export function buildHref(
  base: string,
  current: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  const merged = { ...current, ...overrides };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}
