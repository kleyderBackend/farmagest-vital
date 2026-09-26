export type UserRole = "admin" | "staff";
export type UserId = string;

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}
