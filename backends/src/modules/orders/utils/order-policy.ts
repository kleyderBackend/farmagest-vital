const transitions: Record<string, string[]> = {
  pending: ["preparing", "cancelled"],
  preparing: ["on_the_way", "cancelled"],
  on_the_way: ["delivered", "cancelled"],
  delivered: [], cancelled: [],
};
export function normalizeStatus(status: string) {
  return status === "processing" ? "preparing" : status === "completed" ? "delivered" : status;
}
export function validateTransition(from: string, to: string) {
  from = normalizeStatus(from);
  if (!transitions[from] || !transitions[to]) throw new Error("Estado de pedido inválido");
  if (from !== to && !transitions[from]!.includes(to)) throw new Error("El cambio de estado no está permitido");
}
