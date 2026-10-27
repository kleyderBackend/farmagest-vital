export interface CheckoutQuote {
  subtotal: number;
  envio: number;
  comision: number;
  total: number;
  tasa: number;
  moneda: "COP" | "USD" | "EUR";
  ciudad: string;
  metodo: string;
  fechaTasa: string;
  fuenteTasa: string;
  expiresAt: number;
  items: Array<{ productId: number; quantity: number; price: number }>;
}
