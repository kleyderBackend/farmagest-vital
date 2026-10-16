import type { Request, Response } from "express";
import { listMovementsService } from "../services/list-movements.service";

export async function listMovementsController(_req: Request, res: Response) {
  try {
    const movements = await listMovementsService();
    return res.status(200).json({ status: "success", message: "Movimientos consultados con exito", data: { movements } });
  } catch (error: any) {
    return res.status(500).json({ status: "fail", message: "No se pudieron consultar los movimientos", error: error.message });
  }
}
