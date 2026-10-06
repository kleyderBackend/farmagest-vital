import type { Request, Response } from "express";
import type { CreateProductInput } from "../products.type";
import { createProductService } from "../services/create-products.service";

export async function createProductController(req: Request, res: Response) {
  try {
    const {
      categoryId,
      name,
      presentation,
      description,
      salePrice,
      currentStock,
      minimumStock,
      expirationDate,
      imageUrl,
      isAvailable,
    } = req.body;

    if (categoryId === undefined || categoryId === null) {
      return res.status(400).json({
        status: "fail",
        message: "La categoria es obligatoria",
      });
    }

    const parsedCategoryId = Number(categoryId);

    if (Number.isNaN(parsedCategoryId)) {
      return res.status(400).json({
        status: "fail",
        message: "La categoria debe ser un valor numerico valido",
      });
    }

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        status: "fail",
        message: "El nombre del producto es obligatorio",
      });
    }

    if (salePrice === undefined || salePrice === null) {
      return res.status(400).json({
        status: "fail",
        message: "El precio del producto es obligatorio",
      });
    }

    const parsedSalePrice = Number(salePrice);

    if (Number.isNaN(parsedSalePrice) || parsedSalePrice <= 0) {
      return res.status(400).json({
        status: "fail",
        message: "El precio del producto debe ser un valor numerico mayor que cero",
      });
    }

    const productData: CreateProductInput = {
      categoryId: parsedCategoryId,
      name,
      salePrice: parsedSalePrice,
    };

    if (presentation !== undefined) {
      productData.presentation = presentation;
    }

    if (description !== undefined) {
      productData.description = description;
    }

    if (currentStock !== undefined) {
      const parsedCurrentStock = Number(currentStock);

      if (Number.isNaN(parsedCurrentStock) || parsedCurrentStock < 0) {
        return res.status(400).json({
          status: "fail",
          message:
            "El stock del producto debe ser un valor numerico y no puede ser negativo",
        });
      }

      productData.currentStock = parsedCurrentStock;
    }

    if (minimumStock !== undefined) {
      const parsedMinimumStock = Number(minimumStock);

      if (Number.isNaN(parsedMinimumStock) || parsedMinimumStock < 0) {
        return res.status(400).json({
          status: "fail",
          message:
            "El stock minimo del producto debe ser un valor numerico y no puede ser negativo",
        });
      }

      productData.minimumStock = parsedMinimumStock;
    }

    if (expirationDate !== undefined) {
      productData.expirationDate = expirationDate;
    }

    if (imageUrl !== undefined) {
      productData.imageUrl = imageUrl;
    }

    if (isAvailable !== undefined) {
      productData.isAvailable = Boolean(isAvailable);
    }

    const product = await createProductService(productData);

    return res.status(201).json({
      status: "success",
      message: "Producto creado con exito",
      data: { product },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: "No se pudo crear el producto",
      error: error.message,
    });
  }
}
