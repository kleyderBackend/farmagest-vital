import type { RequestHandler } from "express";

export function rateLimit(max = 30, windowMs = 60_000): RequestHandler {
  const entries = new Map<string, { count: number; expires: number }>();
  return (req, res, next) => {
    const now = Date.now();
    for (const [key, value] of entries) if (value.expires <= now) entries.delete(key);
    const key = req.ip || "unknown";
    const entry = entries.get(key) || { count: 0, expires: now + windowMs };
    entries.set(key, entry);
    if (++entry.count > max) {
      res.setHeader("Retry-After", Math.ceil((entry.expires - now) / 1000));
      res.status(429).json({ message: "Demasiados intentos. Intenta nuevamente en un minuto." });
      return;
    }
    next();
  };
}
