// src/controllers/booking.controller.ts
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendError } from "../../utils/sendError";
import { bookingService } from "./booking.service";
import { sendSuccess } from "../../utils/sendSuccess";


// POST /api/v1/bookings  (auth required: customer/admin)
// We'll use req.user.id as customerId
export const createBooking = catchAsync(async (req: Request, res: Response) => {
  // @ts-ignore
  const currentUser = req.user;

  if (!currentUser) {
    return sendError(res, 401, "Unauthorized");
  }

  const { vehicleId, rentStartDate, rentEndDate } = req.body;

  if (!vehicleId || !rentStartDate || !rentEndDate) {
    return sendError(res, 400, "vehicleId, rentStartDate and rentEndDate are required");
  }

  const idNum = Number(vehicleId);
  if (!idNum || Number.isNaN(idNum)) {
    return sendError(res, 400, "Invalid vehicleId");
  }

  // Basic date validation – detailed logic is inside service
  if (new Date(rentEndDate) <= new Date(rentStartDate)) {
    return sendError(res, 400, "rent_end_date must be after rent_start_date");
  }

  try {
    const booking = await bookingService.createBooking({
      customerId: currentUser.id,
      vehicleId: idNum,
      rentStartDate,
      rentEndDate,
    });

    return sendSuccess(res, booking, 201, "Booking created successfully");
  } catch (err: any) {
    return sendError(res, 400, err.message || "Failed to create booking");
  }
});

// GET /api/v1/bookings  (admin only, or adapt as you like)
export const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const bookings = await bookingService.getAllBookings();
  return sendSuccess(res, bookings, 200, "Bookings retrieved successfully");
});

// GET /api/v1/bookings/:bookingId
export const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.bookingId);

  if (!id || Number.isNaN(id)) {
    return sendError(res, 400, "Invalid booking ID");
  }

  const booking = await bookingService.getBookingById(id);

  if (!booking) {
    return sendError(res, 404, "Booking not found");
  }

  // OPTIONAL: Only owner or admin can see booking
  // @ts-ignore
  const currentUser = req.user;
  if (currentUser && currentUser.role === "customer" && currentUser.id !== booking.customerId) {
    return sendError(res, 403, "Forbidden: You cannot access this booking");
  }

  return sendSuccess(res, booking, 200, "Booking retrieved successfully");
});

// PATCH /api/v1/bookings/:bookingId/status   (admin or owner, your choice)
export const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.bookingId);
  const { status } = req.body;

  if (!id || Number.isNaN(id)) {
    return sendError(res, 400, "Invalid booking ID");
  }

  if (!status || !["active", "cancelled", "returned"].includes(status)) {
    return sendError(res, 400, "Invalid booking status");
  }

  const updated = await bookingService.updateBookingStatus(id, status);

  if (!updated) {
    return sendError(res, 404, "Booking not found");
  }

  return sendSuccess(res, updated, 200, "Booking status updated successfully");
});

// DELETE /api/v1/bookings/:bookingId (optional, depends on your business rule)
export const deleteBooking = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.bookingId);

  if (!id || Number.isNaN(id)) {
    return sendError(res, 400, "Invalid booking ID");
  }

  const booking = await bookingService.getBookingById(id);

  if (!booking) {
    return sendError(res, 404, "Booking not found");
  }

  if (booking.status === "active") {
    return sendError(res, 400, "Active bookings cannot be deleted");
  }

  const deleted = await bookingService.deleteBooking(id);

  if (!deleted) {
    return sendError(res, 404, "Booking not found");
  }

  return sendSuccess(res, null, 200, "Booking deleted successfully");
});

export const bookingController = {
  createBooking,getAllBookings,getBookingById,updateBookingStatus,deleteBooking
};
