import type { Request, Response } from "express";
import { CheckoutQuoteService } from "../services/checkout-quote.service";

export async function checkoutQuoteController(req: Request, res: Response) {
  try {
    const { items, city, method, currency } = req.body;
    const data = await CheckoutQuoteService.cotizar({
      items,
      city,
      method,
      currency,
    });
    return res
      .status(200)
      .json({ status: "success", message: "Cotización calculada", data });
  } catch (error: any) {
    return res
      .status(400)
      .json({
        status: "fail",
        message: "No se pudo cotizar",
        error: error.message,
      });
  }
}
