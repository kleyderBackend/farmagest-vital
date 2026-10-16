import type { Request, Response } from "express";
import { listUsersService } from "../services/list-users.service";

export async function listUsersController(_req: Request, res: Response) {
  try {
    const users = await listUsersService();
    return res.status(200).json({ status: "success", message: "Usuarios consultados con exito", data: { users } });
  } catch (error: any) {
    return res.status(500).json({ status: "fail", message: "No se pudieron consultar los usuarios", error: error.message });
  }
}
