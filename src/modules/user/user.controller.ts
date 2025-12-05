import { Request, Response } from "express";
import { userServices } from "./user.service";
import { sendSuccess } from "../../utils/sendSuccess";
import { catchAsync } from "../../utils/catchAsync";
import { sendError } from "../../utils/sendError";


const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getAllUserIntoDB();

    sendSuccess(res, result, 200, "User retrieved successfully");
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.userId);

  // Validate ID
  if (!id || Number.isNaN(id)) {
    return sendError(res, 400, "Invalid user ID");
  }

  const { name, email, phone, role } = req.body;

  // At least one field must be provided
  if (!name && !email && !phone && !role) {
    return sendError(res, 400, "At least one field is required to update user");
  }

  // // Optional validations
  // if (password && password.length < 6) {
  //   return sendError(res, 400, "Password must be at least 6 characters long");
  // }

  if (role && !["admin", "customer"].includes(role)) {
    return sendError(res, 400, "Role must be 'admin' or 'customer'");
    
  }

 
  const updatedUser = await userServices.updateUser(name, email, phone, role, id);

  if (!updatedUser) {
    return sendError(res, 404, "User not found");
  }

  return sendSuccess(res, updatedUser, 200, "User updated successfully");
});

const deleteUser = catchAsync(async (req:Request, res:Response) => {
  const id = Number(req.params.userId);

  // Validate ID
  if (!id || Number.isNaN(id)) {
    return sendError(res, 400, "Invalid user ID");
  }

  const deletedUser = await userServices.deleteUser(id);

  if (!deletedUser) {
    return sendError(res, 404, "User not found");
  }

  // You can return deleted user or just a message
  return sendSuccess(res, null, 200, "User deleted successfully");
});


export const userController = {
  getAllUser,updateUser,deleteUser
};
