
import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  data: any = null,
  statusCode: number = 200,
  message: string = 'Request successful'
) => {
  const response: any = {
    success: true,
    message,
  };

  // Only include "data" if not null or undefined
  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};
