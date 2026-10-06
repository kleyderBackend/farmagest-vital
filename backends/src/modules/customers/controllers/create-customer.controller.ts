import type { Request, Response } from "express";
import type { CreateCustomerInput } from "../customers.type";
import { createCustomerService } from "../services/create-customer.service";

export async function createCustomerController(req: Request, res: Response) {
  try {
    const { fullName, phone, email, address } = req.body;

    if (!fullName || !phone || !email) {
      return res.status(400).json({
        status: "fail",
        message: "Nombre, telefono y correo son obligatorios",
      });
    }

    const customerData: CreateCustomerInput = {
      fullName,
      phone,
      email,
    };

    if (address !== undefined) {
      customerData.address = address;
    }

    const customer = await createCustomerService(customerData);

    return res.status(201).json({
      status: "success",
      message: "Cliente creado con exito",
      data: { customer },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: "No se pudo crear el cliente",
      error: error.message,
    });
  }
}
