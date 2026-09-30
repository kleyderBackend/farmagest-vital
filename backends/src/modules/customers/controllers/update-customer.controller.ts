import type { Request, Response } from "express";
import type { UpdateCustomerInput } from "../customers.type";
import { updateCustomerService } from "../services/update-customer.service";

export async function updateCustomerController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        status: "fail",
        message: "ID de cliente invalido",
      });
    }

    const customerId = Number(id);

    if (Number.isNaN(customerId)) {
      return res.status(400).json({
        status: "fail",
        message: "ID de cliente invalido",
      });
    }

    const { fullName, phone, email, address } = req.body;

    if (
      fullName === undefined &&
      phone === undefined &&
      email === undefined &&
      address === undefined
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Debe enviar al menos un campo para actualizar",
      });
    }

    const customerData: UpdateCustomerInput = { customerId };

    if (fullName !== undefined) {
      customerData.fullName = fullName;
    }

    if (phone !== undefined) {
      customerData.phone = phone;
    }

    if (email !== undefined) {
      customerData.email = email;
    }

    if (address !== undefined) {
      customerData.address = address;
    }

    const customer = await updateCustomerService(customerData);

    return res.status(200).json({
      status: "success",
      message: "Cliente actualizado con exito",
      data: { customer },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: "No se pudo actualizar el cliente",
      error: error.message,
    });
  }
}
