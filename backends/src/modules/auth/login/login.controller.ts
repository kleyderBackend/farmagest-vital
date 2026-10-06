import type { Request, Response } from "express";
import { LoginService } from "./login.service";

export async function LoginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Todos Los datos deben estar completos",
      });
    }

    const login = await LoginService({
      email,
      password,
    });

    return res.status(200).json({
      status: "success",
      message: "Inicio de sesion",
      login,
    });
  } catch (error: any) {
    return res.status(401).json({
      status: "Fail",
      message: "No se pudo iniciar sesion",
      error: error.message,
    });
  }
}
