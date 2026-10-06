import type { Request, Response } from "express";
import { listCustomersService } from "../services/list-customers.service";

export async function listCustomersController(_req: Request, res: Response) {
  try {
    const customers = await listCustomersService();

    if (customers.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No hay clientes registrados",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Clientes encontrados con exito",
      data: { customers },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "fail",
      message: "Error del servidor",
      error: error.message,
    });
  }
}
