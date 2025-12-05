// utils/sendError.ts
import { Response } from 'express';

export const sendError = (
  res: Response,
  statusCode: number = 500,
  message: string = 'Internal server error',
  errors: any = null
) => {
  const response: any = {
    success: false,
    message,
  };

  if (errors) response.errors = errors;

  // Only show stack trace in development
  if (process.env.NODE_ENV === 'development' && errors?.stack) {
    response.stack = errors.stack;
  }

  return res.status(statusCode).json(response);
};
