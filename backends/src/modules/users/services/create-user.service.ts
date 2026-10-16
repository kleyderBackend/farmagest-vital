import { registerUser } from "../../auth/register/register.service";
import type { RegisterInput } from "../../auth/auth.types";

export async function createUserService(data: RegisterInput) {
  return registerUser(data);
}
