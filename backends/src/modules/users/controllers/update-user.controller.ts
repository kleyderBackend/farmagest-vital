import type { Response } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/auth.middleware";
import type { UpdateUserInput } from "../users.type";
import { updateUserService } from "../services/update-user.service";

export async function updateUserController(req: AuthenticatedRequest, res: Response) {
  try {
    const { fullName, email, role, isActive, password } = req.body;
    const userData: UpdateUserInput = {
      userId: Number(req.params.id), actorId: Number(req.user!.userId),
      fullName, email, role, isActive,
    };
    if (password !== undefined) userData.password = password;
    const user = await updateUserService(userData);
    return res.status(200).json({ status: "success", message: "Usuario actualizado con exito", data: { user } });
  } catch (error: any) {
    return res.status(400).json({ status: "fail", message: "No se pudo actualizar el usuario", error: error.message });
  }
}
