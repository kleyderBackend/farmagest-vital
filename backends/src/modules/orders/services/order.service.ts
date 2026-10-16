import {
  findOrderById,
  listOrders,
  updateOrderDelivery,
  updateOrderStatus,
  findOrderForUpdate,
  findOrderStockItems,
} from "../repositories/order.repository";
import type {
  OrderStatus,
  UpdateOrderDeliveryInput,
  UpdateOrderStatusInput,
} from "../orders.type";
import { executeSaleTransaction } from "../../sales/repositories/transaction.repository";
import { recordMovementService } from "../../inventory/services/record-movement.service";
import { normalizeStatus, validateTransition } from "../utils/order-policy";
import { incrementStock } from "../../inventory/repositories/stock.repository";

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
  if (!/^(?:FV-?)?\d{1,10}$/.test(normalizedCode)) return null;
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

export async function trackOrderByCodeService(code: string, email: string) {
  const orderId = parseOrderCode(code);

  if (!orderId) {
    throw new Error("El numero de pedido debe tener formato FV-000001");
  }

  const order = await findOrderById(orderId);
  if (!order || typeof email !== "string" || order.customer_email.toLowerCase() !== email.trim().toLowerCase()) return null;
  return order;
}

export async function updateOrderStatusService(data: UpdateOrderStatusInput) {
  const { orderId, status } = data;

  if (!orderId || Number.isNaN(orderId)) {
    throw new Error("ID de pedido invalido");
  }

  if (!allowedStatuses.includes(status)) {
    throw new Error("Estado de pedido invalido");
  }

  return executeSaleTransaction(async (db) => {
    const order = await findOrderForUpdate(orderId, db);
    if (!order) throw new Error("El pedido no existe");
    validateTransition(order.status, status);
    if (normalizeStatus(order.status) === status) return findOrderById(orderId, db);
    if (status === "cancelled") {
      const items = await findOrderStockItems(orderId, db);
      for (const item of items) {
        await incrementStock(Number(item.product_id), Number(item.quantity), db);
        await recordMovementService({ productId: Number(item.product_id), userId: data.userId, type: "in", quantity: Number(item.quantity), reason: `Cancelación del pedido ${formatOrderCode(orderId)}` }, db);
      }
    }
    return updateOrderStatus(orderId, status, db);
  });
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
