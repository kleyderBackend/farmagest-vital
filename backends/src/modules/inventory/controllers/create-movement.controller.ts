import type { Response } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/auth.middleware";
import type { CreateMovementInput } from "../inventory.type";
import { createMovementService } from "../services/create-movement.service";

export async function createMovementController(req: AuthenticatedRequest, res: Response) {
  try {
    const { productId, type, quantity, reason } = req.body;
    if (productId === undefined || quantity === undefined || !type || !reason) {
      return res.status(400).json({ status: "fail", message: "Producto, tipo, cantidad y motivo son obligatorios" });
    }
    const movementData: CreateMovementInput = {
      productId: Number(productId),
      userId: Number(req.user!.userId),
      type,
      quantity: Number(quantity),
      reason,
    };
    const movement = await createMovementService(movementData);
    return res.status(201).json({ status: "success", message: "Movimiento registrado con exito", data: { movement } });
  } catch (error: any) {
    return res.status(400).json({ status: "fail", message: "No se pudo registrar el movimiento", error: error.message });
  }
}
