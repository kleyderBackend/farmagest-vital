/** Selección explícita de API: MySQL local o PostgreSQL en Render. */
export const LOCAL_API_URL = "http://localhost:3001/api";
export const PRODUCTION_API_URL = "https://farmagest-vital-backend.onrender.com/api";
export const isLoopback = (hostname) => ["localhost", "127.0.0.1", "[::1]"].includes(hostname);

/** Ignora configuraciones inválidas y direcciones locales guardadas en una web pública. */
export function resolveApiUrl(location, savedUrl) {
  const local = location.protocol === "file:" || isLoopback(location.hostname);
  const fallback = local ? LOCAL_API_URL : PRODUCTION_API_URL;
  if (savedUrl) {
    try {
      const url = new URL(savedUrl);
      if (["http:", "https:"].includes(url.protocol) && !url.username && !url.password &&
          (local || (!isLoopback(url.hostname) && url.protocol === "https:"))) {
        return url.origin + url.pathname.replace(/\/+$/, "");
      }
    } catch {
      return fallback;
    }
  }
  return fallback;
}
