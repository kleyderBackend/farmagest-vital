import {
  findOrderById,
  listOrders,
  updateOrderDelivery,
  updateOrderStatus,
} from "../repositories/order.repository";
import type {
  OrderStatus,
  UpdateOrderDeliveryInput,
  UpdateOrderStatusInput,
} from "../orders.type";

const allowedStatuses: OrderStatus[] = [
  "pending",
  "preparing",
  "on_the_way",
  "delivered",
  "cancelled",
];

export function formatOrderCode(orderId: number) {
  return `FV-${String(orderId).padStart(6, "0")}`;
}

export function parseOrderCode(code: string) {
  const normalizedCode = decodeURIComponent(code).trim().toUpperCase();
  const numericCode = normalizedCode.replace(/^FV-?/, "");
  const orderId = Number(numericCode);

  if (!numericCode || Number.isNaN(orderId) || orderId <= 0) {
    return null;
  }

  return orderId;
}

export async function listOrdersService() {
  return listOrders();
}

export async function findOrderByIdService(orderId: number) {
  if (!orderId || Number.isNaN(orderId)) {
    throw new Error("ID de pedido invalido");
  }

  return findOrderById(orderId);
}

export async function trackOrderByCodeService(code: string) {
  const orderId = parseOrderCode(code);

  if (!orderId) {
    throw new Error("El numero de pedido debe tener formato FV-000001");
  }

  return findOrderById(orderId);
}

export async function updateOrderStatusService(data: UpdateOrderStatusInput) {
  const { orderId, status } = data;

  if (!orderId || Number.isNaN(orderId)) {
    throw new Error("ID de pedido invalido");
  }

  if (!allowedStatuses.includes(status)) {
    throw new Error("Estado de pedido invalido");
  }

  const order = await findOrderById(orderId);

  if (!order) {
    throw new Error("El pedido no existe");
  }

  return updateOrderStatus(orderId, status);
}

export async function updateOrderDeliveryService(
  data: UpdateOrderDeliveryInput,
) {
  if (!data.orderId || Number.isNaN(data.orderId)) {
    throw new Error("ID de pedido invalido");
  }

  const order = await findOrderById(data.orderId);

  if (!order) {
    throw new Error("El pedido no existe");
  }

  return updateOrderDelivery(data);
}
