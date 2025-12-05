// src/errors/AppError.ts
export class AppError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode = 500, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
