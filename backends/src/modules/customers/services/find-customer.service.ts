import {
  findCustomerByEmail,
  findCustomerById,
} from "../repositories/find-customer.repository";

export async function findCustomerByIdService(customerId: number) {
  if (!customerId || Number.isNaN(customerId)) {
    throw new Error("ID de cliente invalido");
  }

  return findCustomerById(customerId);
}

export async function findCustomerByEmailService(email: string) {
  if (!email) {
    throw new Error("Correo de cliente invalido");
  }

  return findCustomerByEmail(email);
}
