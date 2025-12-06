import { Request, Response } from "express";
import { userService } from "./user.service";
import { sendSuccess } from "../../utils/sendSuccess";
import { catchAsync } from "../../utils/catchAsync";
import { sendError } from "../../utils/sendError";
import { bookingService } from "../booking/booking.service";


const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getAllUserIntoDB();

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
 
  const updatedUser = await userService.updateUser(name, email, phone, role, id);

  if (!updatedUser) {
    return sendError(res, 404, "User not found");
  }

  return sendSuccess(res, updatedUser, 200, "User updated successfully");
});


const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);

  if (!userId || Number.isNaN(userId)) {
    return sendError(res, 400, 'Invalid user ID');
  }

  // @ts-ignore
  const currentUser = req.user;

  if (!currentUser || currentUser.role !== 'admin') {
    return sendError(res, 403, 'Forbidden: Only admin can delete users');
  }

  // Check if user has active bookings
  const hasActive = await bookingService.userHasActiveBookings(userId);

  if (hasActive) {
    return sendError(
      res,
      400, // you could also use 409 Conflict (not in your list though)
      'User cannot be deleted while having active bookings'
    );
  }

  const deletedUser = await userService.deleteUser(userId);

  if (!deletedUser) {
    return sendError(res, 404, 'User not found');
  }

  return sendSuccess(res, null, 200, 'User deleted successfully');
});



export const userController = {
  getAllUser,updateUser,deleteUser
};
