import bcrypt from "bcrypt";
import type { RegisterInput } from "../auth.types";
import { createUser, findUserByEmail } from "./register.repository";

export async function registerUser(data: RegisterInput) {
  const { fullName, email, password, role, isActive } = data;

  if (typeof fullName !== "string" || !fullName.trim() || fullName.length > 200 ||
    typeof email !== "string" || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof password !== "string" || password.length < 12 || Buffer.byteLength(password) > 72 ||
    (role !== undefined && !["admin", "staff"].includes(role)) ||
    (isActive !== undefined && typeof isActive !== "boolean")) {
    throw new Error("Nombre, correo, rol o contraseña inválidos (mínimo 12 caracteres, máximo 72 bytes)");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error("El correo ya esta registrado");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await createUser({
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash,
    role: role ?? "staff",
    isActive: isActive ?? true,
  });

  return newUser;
}
