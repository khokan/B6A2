import { Request, Response } from "express";
import { authServices } from "./auth.service";
import { sendSuccess } from "../../utils/sendSuccess";
import { sendError } from "../../utils/sendError";
import { catchAsync } from "../../utils/catchAsync";

const signupUser = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password || !phone || !role) {
    return sendError(res, 400, "All fields (name, email, password, phone, role) are required");
  }

  if (typeof email !== "string" || !email.includes("@")) {
    return sendError(res, 400, "Invalid email format");
  }

  if (!["admin", "customer"].includes(role)) {
    return sendError(res, 400, "Role must be admin or customer");
  }

  if (typeof password !== "string" || password.length < 6) {
    return sendError(res, 400, "Password must be at least 6 characters");
  }

  const user = await authServices.signupUser({
    name,
    email,
    password,
    phone,
    role,
  });

  return sendSuccess(res, user, 201, "User registered successfully");
});

const signinUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 400, "Email and password are required");
  }

  const result = await authServices.signinUser(email, password);

  if (!result) {
    return sendError(res, 401, "Invalid email or password");
  }

  return sendSuccess(res, result, 200, "Login successful");
});

export const authController = {
  signupUser,
  signinUser,
};
