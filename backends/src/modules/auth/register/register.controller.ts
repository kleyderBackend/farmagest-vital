import type { Request, Response } from "express";
import { registerUser } from "./register.service";

export async function RegisterUserController(req: Request, res: Response) {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({
        status: "Fail",
        message: "Todos los datos deben estar presentes",
      });
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "Fail",
        message: "Formato de correo electronico incorrecto",
      });
    }

    const user = await registerUser({ fullName, email, password, role });
    return res.status(201).json({
      status: "success",
      message: "Usuario creado con exito",
      newUser: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "Fail",
      message: "Error del servidor",
      error: error.message,
    });
  }
}
