import bcrypt from "bcrypt";
import { executeSaleTransaction } from "../../sales/repositories/transaction.repository";
import { findUserByEmail } from "../../auth/register/register.repository";
import { findActiveAdminsForUpdate, findUserById } from "../repositories/find-user.repository";
import { updateUser } from "../repositories/update-user.repository";
import type { UpdateUserInput } from "../users.type";

export async function updateUserService(data: UpdateUserInput) {
  const { userId, actorId, fullName, email, role, isActive, password } = data;
  if (!Number.isSafeInteger(userId) || userId < 1 || typeof fullName !== "string" ||
    !fullName.trim() || fullName.length > 200 || typeof email !== "string" || email.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !["admin", "staff"].includes(role) || typeof isActive !== "boolean") {
    throw new Error("Datos de usuario inválidos");
  }
  if (password !== undefined && (typeof password !== "string" || password.length < 12 || Buffer.byteLength(password) > 72)) {
    throw new Error("La contraseña debe tener al menos 12 caracteres y como máximo 72 bytes");
  }
  const normalizedEmail = email.trim().toLowerCase();
  const existingEmail = await findUserByEmail(normalizedEmail);
  if (existingEmail && Number(existingEmail.user_id) !== userId) throw new Error("El correo ya está registrado");
  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  return executeSaleTransaction(async (db) => {
    const admins = await findActiveAdminsForUpdate(db);
    const existingUser = await findUserById(userId, db, true);
    if (!existingUser) throw new Error("El usuario no existe");
    if (userId === actorId && (!isActive || role !== "admin")) {
      throw new Error("No puedes desactivar o quitar el rol a tu propia cuenta");
    }
    if (admins.length === 1 && Number(admins[0].user_id) === userId && (!isActive || role !== "admin")) {
      throw new Error("Debe existir un administrador activo");
    }
    return updateUser({ userId, fullName: fullName.trim(), email: normalizedEmail, role, isActive, passwordHash }, db);
  });
}
