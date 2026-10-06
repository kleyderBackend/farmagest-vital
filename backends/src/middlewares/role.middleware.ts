import type { NextFunction, Response } from "express";
import type { UserRole } from "../modules/auth/auth.types";
import type { AuthenticatedRequest } from "./auth.middleware";

export function roleMiddleware(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: "fail",
        message: "Usuario no autenticado",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "No tienes permisos para realizar esta accion",
      });
    }

    return next();
  };
}
