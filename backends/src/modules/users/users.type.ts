import type { UserRole } from "../auth/auth.types";

export interface UpdateUserInput {
  userId: number;
  actorId: number;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  password?: string;
}

export interface UpdateUserRecord extends Omit<UpdateUserInput, "actorId" | "password"> {
  passwordHash: string | null;
}
