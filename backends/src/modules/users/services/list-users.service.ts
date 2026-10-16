import { listUsers } from "../repositories/list-users.repository";

export async function listUsersService() {
  return listUsers();
}
