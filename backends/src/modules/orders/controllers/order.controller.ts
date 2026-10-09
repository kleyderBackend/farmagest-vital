import type { Request, Response } from "express";
import {
  findOrderByIdService,
  formatOrderCode,
  listOrdersService,
  trackOrderByCodeService,
  updateOrderDeliveryService,
  updateOrderStatusService,
} from "../services/order.service";
import type { OrderStatus, UpdateOrderDeliveryInput } from "../orders.type";

function mapTrackingResponse(order: any) {
  return {
    orderCode: formatOrderCode(Number(order.order_id)),
    orderId: order.order_id,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    orderDate: order.order_date,
    status: order.status,
    total: order.total,
    delivery: {
      address: order.delivery_address || order.customer_address,
      neighborhood: order.delivery_neighborhood,
      city: order.delivery_city,
      note: order.delivery_note,
    },
    notes: order.notes,
    items: order.items,
  };
}

export async function listOrdersController(_req: Request, res: Response) {
  try {
    const orders = await listOrdersService();

    if (orders.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No hay pedidos registrados",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Pedidos encontrados con exito",
      data: { orders },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "fail",
      message: "Error del servidor",
      error: error.message,
    });
  }
}

export async function findOrderByIdController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const orderId = Number(id);

    if (!id || Number.isNaN(orderId)) {
      return res.status(400).json({
        status: "fail",
        message: "ID de pedido invalido",
      });
    }

    const order = await findOrderByIdService(orderId);

    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "El pedido no existe",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Pedido encontrado con exito",
      data: { order },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: "No se pudo buscar el pedido",
      error: error.message,
    });
  }
}

export async function trackOrderByCodeController(req: Request, res: Response) {
  try {
    const { code } = req.params;

    if (!code || Array.isArray(code)) {
      return res.status(400).json({
        status: "fail",
        message: "Numero de pedido invalido",
      });
    }

    const order = await trackOrderByCodeService(code);

    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "No encontramos una compra con ese numero de pedido",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Seguimiento de pedido encontrado",
      data: { tracking: mapTrackingResponse(order) },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: "No se pudo consultar el seguimiento",
      error: error.message,
    });
  }
}

export async function updateOrderStatusController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const orderId = Number(id);

    if (!id || Number.isNaN(orderId)) {
      return res.status(400).json({
        status: "fail",
        message: "ID de pedido invalido",
      });
    }

    if (!status || typeof status !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "El estado del pedido es obligatorio",
      });
    }

    const order = await updateOrderStatusService({
      orderId,
      status: status as OrderStatus,
    });

    return res.status(200).json({
      status: "success",
      message: "Estado del pedido actualizado con exito",
      data: { order },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: "No se pudo actualizar el estado del pedido",
      error: error.message,
    });
  }
}

export async function updateOrderDeliveryController(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;
    const { deliveryAddress, deliveryNeighborhood, deliveryCity, deliveryNote } =
      req.body;
    const orderId = Number(id);

    if (!id || Number.isNaN(orderId)) {
      return res.status(400).json({
        status: "fail",
        message: "ID de pedido invalido",
      });
    }

    const deliveryData: UpdateOrderDeliveryInput = { orderId };

    if (deliveryAddress !== undefined) {
      deliveryData.deliveryAddress = deliveryAddress;
    }

    if (deliveryNeighborhood !== undefined) {
      deliveryData.deliveryNeighborhood = deliveryNeighborhood;
    }

    if (deliveryCity !== undefined) {
      deliveryData.deliveryCity = deliveryCity;
    }

    if (deliveryNote !== undefined) {
      deliveryData.deliveryNote = deliveryNote;
    }

    const order = await updateOrderDeliveryService(deliveryData);

    return res.status(200).json({
      status: "success",
      message: "Datos de entrega actualizados con exito",
      data: { order },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: "No se pudieron actualizar los datos de entrega",
      error: error.message,
    });
  }
}
