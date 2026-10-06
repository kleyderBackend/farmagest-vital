import { findAuthUserByEmail } from "./login.repository";
import type { LoginInput } from "../auth.types";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function LoginService(data: LoginInput) {
  const { email, password } = data;

  const existingUser = await findAuthUserByEmail(email);

  if (!existingUser) {
    throw new Error("Email incorrecto");
  }

  if (!existingUser.is_active) {
    throw new Error("Usuario inactivo");
  }

  const comparePassword = await bcrypt.compare(
    password,
    existingUser.password_hash
  );

  if (!comparePassword) {
    throw new Error("Contraseña incorrecta");
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET no esta configurado");
  }

  const token = jwt.sign(
    {
      userId: existingUser.user_id,
      role: existingUser.role,
    },
    jwtSecret,
    {
      expiresIn: "1d",
    }
  );

  return {
    token,
    user: {
      userId: existingUser.user_id,
      fullName: existingUser.full_name,
      email: existingUser.email,
      role: existingUser.role,
      isActive: existingUser.is_active,
    },
  };
}
