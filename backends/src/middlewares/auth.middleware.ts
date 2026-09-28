import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { UserId, UserRole } from "../modules/auth/auth.types";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: UserId;
    role: UserRole;
  };
}

interface JwtPayload {
  userId: UserId;
  role: UserRole;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.get("authorization");

  if (!authHeader) {
    return res.status(401).json({
      status: "fail",
      message: "Token no proporcionado",
    });
  }

  const [scheme, token] = authHeader.trim().split(/\s+/);

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return res.status(401).json({
      status: "fail",
      message: "Formato de token invalido",
    });
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({
      status: "fail",
      message: "JWT_SECRET no esta configurado",
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    return next();
  } catch {
    return res.status(401).json({
      status: "fail",
      message: "Token invalido o expirado",
    });
  }
}
