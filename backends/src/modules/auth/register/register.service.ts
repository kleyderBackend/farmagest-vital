import bcrypt from "bcrypt";
import type { RegisterInput } from "../auth.types";
import { createUser, findUserByEmail } from "./register.repository";

export async function registerUser(data: RegisterInput) {
  const { fullName, email, password, role } = data;

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error("El correo ya esta registrado");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await createUser({
    fullName,
    email,
    passwordHash,
    role: role ?? "staff",
  });

  return newUser;
}
