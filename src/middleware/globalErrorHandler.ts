// src/middlewares/globalErrorHandler.ts
import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/sendError";
import { HTTP } from "../utils/httpStatus";


export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("🔥 ERROR:", err);

  const statusCode = err.statusCode || HTTP.INTERNAL_ERROR;
  const message = err.message || "Internal Server Error";

  return sendError(res, {
    statusCode,
    message,
    errors: err.errors || null,
  });
};
