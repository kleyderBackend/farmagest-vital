import { findCustomerByEmail, findCustomerById } from "../repositories/find-customer.repository";
import { updateCustomer } from "../repositories/update-customer.repository";
import type { UpdateCustomerInput } from "../customers.type";

export async function updateCustomerService(data: UpdateCustomerInput) {
  const existingCustomer = await findCustomerById(data.customerId);

  if (!existingCustomer) {
    throw new Error("El cliente no existe");
  }

  if (data.email !== undefined) {
    const customerWithSameEmail = await findCustomerByEmail(data.email);

    if (
      customerWithSameEmail &&
      customerWithSameEmail.customer_id !== data.customerId
    ) {
      throw new Error("Ya existe otro cliente con ese correo");
    }
  }

  const customer = await updateCustomer(data);

  if (!customer) {
    throw new Error("No se pudo actualizar el cliente");
  }

  return customer;
}
