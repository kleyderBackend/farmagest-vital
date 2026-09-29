export const API_BASE_URL =
  localStorage.getItem("farmagestApiUrl") || "http://localhost:3000/api";

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function requireAdminSession() {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    window.location.href = "/frontends/dashboards/auth/login.html";
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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.error || data?.message || "No se pudo completar la solicitud";
    throw new Error(message);
  }

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
