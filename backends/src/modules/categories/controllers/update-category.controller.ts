import type { Request, Response } from "express";
import type { UpdateCategoryInput } from "../categories.type";
import {
  deactivateCategoryService,
  updateCategoryService,
} from "../services/update-category.service";

export async function updateCategoryController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        status: "fail",
        message: "ID de categoria invalido",
      });
    }

    const categoryId = Number(id);

    if (Number.isNaN(categoryId)) {
      return res.status(400).json({
        status: "fail",
        message: "ID de categoria invalido",
      });
    }

    const { name, description, isActive } = req.body;

    if (
      name === undefined &&
      description === undefined &&
      isActive === undefined
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Debe enviar al menos un campo para actualizar",
      });
    }

    const categoryData: UpdateCategoryInput = {
      categoryId,
    };

    if (name !== undefined) {
      categoryData.name = name;
    }

    if (description !== undefined) {
      categoryData.description = description;
    }

    if (isActive !== undefined) {
      categoryData.isActive = Boolean(isActive);
    }

    const category = await updateCategoryService(categoryData);

    return res.status(200).json({
      status: "success",
      message: "Categoria actualizada con exito",
      data: { category },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "fail",
      message: "Error del servidor",
      error: error.message,
    });
  }
}

export async function deactivateCategoryController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        status: "fail",
        message: "ID de categoria invalido",
      });
    }

    const categoryId = Number(id);

    if (Number.isNaN(categoryId)) {
      return res.status(400).json({
        status: "fail",
        message: "ID de categoria invalido",
      });
    }

    const category = await deactivateCategoryService(categoryId);

    return res.status(200).json({
      status: "success",
      message: "Categoria desactivada con exito",
      data: { category },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "fail",
      message: "Error del servidor",
      error: error.message,
    });
  }
}
