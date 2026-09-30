import type { Request, Response } from "express";
import {
  findCustomerByEmailService,
  findCustomerByIdService,
} from "../services/find-customer.service";

export async function findCustomerByIdController(req: Request, res: Response) {
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

    const customer = await findCustomerByIdService(customerId);

    if (!customer) {
      return res.status(404).json({
        status: "fail",
        message: "El cliente no existe",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Cliente encontrado con exito",
      data: { customer },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: "No se pudo buscar el cliente",
      error: error.message,
    });
  }
}

export async function findCustomerByEmailController(
  req: Request,
  res: Response,
) {
  try {
    const { email } = req.params;

    if (!email || Array.isArray(email)) {
      return res.status(400).json({
        status: "fail",
        message: "Correo de cliente invalido",
      });
    }

    const customer = await findCustomerByEmailService(email);

    if (!customer) {
      return res.status(404).json({
        status: "fail",
        message: "El cliente no existe",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Cliente encontrado con exito",
      data: { customer },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: "No se pudo buscar el cliente",
      error: error.message,
    });
  }
}
