import { resolveApiUrl } from "./api-config.js";

export const API_BASE_URL = resolveApiUrl(window.location, localStorage.getItem("farmagestApiUrl"));

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const user = localStorage.getItem("user");
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
}

export function requireAdminSession() {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    window.location.href = new URL("../dashboards/auth/login.html", import.meta.url).href;
    return false;
  }

  return true;
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (options.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const { auth, timeoutMs = 65000, ...fetchOptions } = options;
  const signal = fetchOptions.signal ?? AbortSignal.timeout(timeoutMs);
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      signal,
      headers,
    });
  } catch (error) {
    if (fetchOptions.signal?.aborted) throw error;
    const connectionError = new Error("No pudimos conectar con el servicio. Intenta nuevamente en unos momentos.");
    connectionError.code = "API_UNAVAILABLE";
    throw connectionError;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && options.auth !== false) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = new URL("../dashboards/auth/login.html", import.meta.url).href;
    }
    const message =
      data?.error || data?.message || "No se pudo completar la solicitud";
    throw new Error(message);
  }

  if (data === null) throw new Error("El servidor devolvió una respuesta inválida. Revisa la dirección de la API.");
  return data;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-CO").format(new Date(value));
}
