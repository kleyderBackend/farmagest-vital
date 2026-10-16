export function expirationStatus(value, now = new Date(), days = 30) {
  if (!value) return "none";
  const datePart = String(value).slice(0, 10);
  const expiration = new Date(`${datePart}T00:00:00`);
  if (!Number.isFinite(expiration.getTime())) return "none";
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const limit = new Date(today);
  limit.setDate(limit.getDate() + days);
  if (expiration < today) return "expired";
  return expiration <= limit ? "soon" : "valid";
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}
