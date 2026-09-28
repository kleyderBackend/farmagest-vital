import type { Request, Response } from "express";
import {
  findProductByIdService,
  findProductByNameService,
} from "../services/find-products.service";

export async function findProductByIdController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "fail",
        message: "Id de producto obligatorio",
      });
    }

    const productId = Number(id);

    if (Number.isNaN(productId)) {
      return res.status(400).json({
        status: "fail",
        message: "Id de producto invalido",
      });
    }

    const product = await findProductByIdService(productId);

    return res.status(200).json({
      status: "success",
      message: "Producto encontrado con exito",
      data: { product },
    });
  } catch (error: any) {
    return res.status(404).json({
      status: "fail",
      message: "No se pudo encontrar el producto",
      error: error.message,
    });
  }
}

export async function findProductByNameController(req: Request, res: Response) {
  try {
    const nameParam = req.params.name;
    const name = Array.isArray(nameParam) ? nameParam[0] : nameParam;

    if (!name) {
      return res.status(400).json({
        status: "fail",
        message: "Nombre de producto obligatorio",
      });
    }

    const product = await findProductByNameService(name);

    return res.status(200).json({
      status: "success",
      message: "Producto encontrado con exito",
      data: { product },
    });
  } catch (error: any) {
    return res.status(404).json({
      status: "fail",
      message: "No se pudo encontrar el producto",
      error: error.message,
    });
  }
}
