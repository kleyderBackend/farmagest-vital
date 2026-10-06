import { createCustomer } from "../repositories/create-customer.repository";
import { findCustomerByEmail } from "../repositories/find-customer.repository";
import type { CreateCustomerInput } from "../customers.type";

export async function createCustomerService(data: CreateCustomerInput) {
  const { fullName, phone, email, address } = data;

  if (!fullName || !phone || !email) {
    throw new Error("Nombre, telefono y correo son obligatorios");
  }

  const existingCustomer = await findCustomerByEmail(email);

  if (existingCustomer) {
    throw new Error("Ya existe un cliente con ese correo");
  }

  const customerData: CreateCustomerInput = {
    fullName,
    phone,
    email,
  };

  if (address !== undefined) {
    customerData.address = address;
  }

  return createCustomer(customerData);
}
