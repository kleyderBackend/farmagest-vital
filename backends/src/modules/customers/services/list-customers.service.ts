import { listCustomers } from "../repositories/list-customers.repository";

export async function listCustomersService() {
  return listCustomers();
}
