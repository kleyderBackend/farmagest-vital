import type { Request, Response } from "express";
import type { RegisterInput } from "../../auth/auth.types";
import { createUserService } from "../services/create-user.service";

export async function createUserController(req: Request, res: Response) {
  try {
    const { fullName, email, password, role, isActive } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ status: "fail", message: "Nombre, correo y contraseña son obligatorios" });
    }
    const userData: RegisterInput = { fullName, email, password };
    if (role !== undefined) userData.role = role;
    if (isActive !== undefined) userData.isActive = isActive;
    const user = await createUserService(userData);
    return res.status(201).json({ status: "success", message: "Usuario creado con exito", data: { user } });
  } catch (error: any) {
    return res.status(400).json({ status: "fail", message: "No se pudo crear el usuario", error: error.message });
  }
}
