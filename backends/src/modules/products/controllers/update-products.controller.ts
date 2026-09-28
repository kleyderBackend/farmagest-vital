import type { Request, Response } from "express";
import type { UpdateProductInput } from "../products.type";
import {
  deactivateProductService,
  updateProductService,
} from "../services/update-products.service";

function parseOptionalBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

export async function updateProductController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        status: "fail",
        message: "ID de producto invalido",
      });
    }

    const productId = Number(id);

    if (Number.isNaN(productId)) {
      return res.status(400).json({
        status: "fail",
        message: "ID de producto invalido",
      });
    }

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
      isActive,
    } = req.body;

    if (
      categoryId === undefined &&
      name === undefined &&
      presentation === undefined &&
      description === undefined &&
      salePrice === undefined &&
      currentStock === undefined &&
      minimumStock === undefined &&
      expirationDate === undefined &&
      imageUrl === undefined &&
      isAvailable === undefined &&
      isActive === undefined
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Debe enviar al menos un campo para actualizar",
      });
    }

    const productData: UpdateProductInput = {
      productId,
    };

    if (categoryId !== undefined) {
      const parsedCategoryId = Number(categoryId);

      if (Number.isNaN(parsedCategoryId)) {
        return res.status(400).json({
          status: "fail",
          message: "La categoria debe ser un valor numerico valido",
        });
      }

      productData.categoryId = parsedCategoryId;
    }

    if (name !== undefined) {
      productData.name = name;
    }

    if (presentation !== undefined) {
      productData.presentation = presentation;
    }

    if (description !== undefined) {
      productData.description = description;
    }

    if (salePrice !== undefined) {
      const parsedSalePrice = Number(salePrice);

      if (Number.isNaN(parsedSalePrice) || parsedSalePrice <= 0) {
        return res.status(400).json({
          status: "fail",
          message: "El precio del producto debe ser un valor numerico mayor que cero",
        });
      }

      productData.salePrice = parsedSalePrice;
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
      const parsedIsAvailable = parseOptionalBoolean(isAvailable);

      if (parsedIsAvailable === undefined) {
        return res.status(400).json({
          status: "fail",
          message: "El estado disponible debe ser verdadero o falso",
        });
      }

      productData.isAvailable = parsedIsAvailable;
    }

    if (isActive !== undefined) {
      const parsedIsActive = parseOptionalBoolean(isActive);

      if (parsedIsActive === undefined) {
        return res.status(400).json({
          status: "fail",
          message: "El estado activo debe ser verdadero o falso",
        });
      }

      productData.isActive = parsedIsActive;
    }

    const product = await updateProductService(productData);

    return res.status(200).json({
      status: "success",
      message: "Producto actualizado con exito",
      data: { product },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: "No se pudo actualizar el producto",
      error: error.message,
    });
  }
}

export async function deactivateProductController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        status: "fail",
        message: "ID de producto invalido",
      });
    }

    const productId = Number(id);

    if (Number.isNaN(productId)) {
      return res.status(400).json({
        status: "fail",
        message: "ID de producto invalido",
      });
    }

    const product = await deactivateProductService(productId);

    return res.status(200).json({
      status: "success",
      message: "Producto desactivado con exito",
      data: { product },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: "No se pudo desactivar el producto",
      error: error.message,
    });
  }
}
