import {
  listProductService,
  listActiveProductService,
  listAvailableProductService,
  listProductsByCategoryService,
} from "../services/list-products.service";
import type { Request, Response } from "express";

export async function listProductController(_req: Request, res: Response) {
  try {
    const products = await listProductService();

    if (products.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "No hay productos registrados",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Productos encontrados con exito",
      data: { products },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "fail",
      message: "Error del servidor",
      error: error.message,
    });
  }
}

export async function listActiveProductController(_req: Request, res: Response) {
  try {
    const products = await listActiveProductService();

    if (products.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "No hay productos activos registrados",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Productos activos encontrados con exito",
      data: { products },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "fail",
      message: "Error del servidor",
      error: error.message,
    });
  }
}

export async function listAvailableProductController(
  _req: Request,
  res: Response,
) {
  try {
    const products = await listAvailableProductService();

    if (products.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "No hay productos disponibles registrados",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Productos disponibles encontrados con exito",
      data: { products },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "fail",
      message: "Error del servidor",
      error: error.message,
    });
  }
}

export async function listProductsByCategoryController(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "fail",
        message: "La categoria es obligatoria",
      });
    }

    const parsedCategoryId = Number(id);

    if (Number.isNaN(parsedCategoryId)) {
      return res.status(400).json({
        status: "fail",
        message: "La categoria debe ser un valor numerico valido",
      });
    }
    const listProducts = await listProductsByCategoryService(parsedCategoryId);

    if (listProducts.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "No hay productos registrados en esta categoria",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Productos encontrados con exito",
      data: { listProducts },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: "No se pudieron listar los productos de la categoria",
      error: error.message,
    });
  }
}
