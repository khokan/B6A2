// src/controllers/booking.controller.ts
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendError } from "../../utils/sendError";
import { bookingService } from "./booking.service";
import { sendSuccess } from "../../utils/sendSuccess";


// POST /api/v1/bookings
// Access: Customer or Admin
 const createBooking = catchAsync(async (req: Request, res: Response) => {
  // @ts-ignore
  const currentUser = req.user;

  if (!currentUser) {
    return sendError(res, 401, "Unauthorized");
  }

  const { vehicle_id:vehicleId, rent_start_date: rentStartDate, rent_end_date:rentEndDate } = req.body;

  if (!vehicleId || !rentStartDate || !rentEndDate) {
    return sendError(res, 400, "vehicleId, rentStartDate and rentEndDate are required");
  }

  const vehicleIdNum = Number(vehicleId);
  if (!vehicleIdNum || Number.isNaN(vehicleIdNum)) {
    return sendError(res, 400, "Invalid vehicleId");
  }

  if (new Date(rentEndDate) <= new Date(rentStartDate)) {
    return sendError(res, 400, "rent_end_date must be after rent_start_date");
  }

  try {
    const booking = await bookingService.createBooking({
      customerId: currentUser.id,
      vehicleId: vehicleIdNum,
      rentStartDate,
      rentEndDate,
    });

    return sendSuccess(res, booking, 201, "Booking created successfully");
  } catch (err: any) {
    return sendError(res, 400, err.message || "Failed to create booking");
  }
});

// GET /api/v1/bookings
// Access: Role-based
// Admin: all bookings
// Customer: own bookings
 const getBookings = catchAsync(async (req: Request, res: Response) => {
  // @ts-ignore
  const currentUser = req.user;

  if (!currentUser) {
    return sendError(res, 401, "Unauthorized");
  }

  if (currentUser.role === "admin") {
    const bookings = await bookingService.getAllBookings();
    return sendSuccess(res, bookings, 200, "Bookings retrieved successfully");
  }

  const bookings = await bookingService.getBookingsByCustomer(currentUser.id);
  return sendSuccess(res, bookings, 200, "Your bookings retrieved successfully");
});

// PUT /api/v1/bookings/:bookingId
// Role-based:
// - Customer: cancel booking (before start date only)
// - Admin: mark as "returned" (vehicle -> available)
 const updateBooking = catchAsync(async (req: Request, res: Response) => {
  const bookingId = Number(req.params.bookingId);

  if (!bookingId || Number.isNaN(bookingId)) {
    return sendError(res, 400, "Invalid booking ID");
  }

  // @ts-ignore
  const currentUser = req.user;

  if (!currentUser) {
    return sendError(res, 401, "Unauthorized");
  }

  // Customer: cancel
  if (currentUser.role === "customer") {
    try {
      const updated = await bookingService.cancelBookingByCustomer(
        bookingId,
        currentUser.id
      );

      return sendSuccess(res, updated, 200, "Booking cancelled successfully");
    } catch (err: any) {
      return sendError(res, 400, err.message || "Failed to cancel booking");
    }
  }

  // Admin: mark as returned
  if (currentUser.role === "admin") {
    try {
      const updated = await bookingService.markBookingReturnedByAdmin(bookingId);

      return sendSuccess(res, updated, 200, "Booking marked as returned. Vehicle is now available");
    } catch (err: any) {
      return sendError(res, 400, err.message || "Failed to update booking");
    }
  }

  return sendError(res, 403, "Forbidden: Invalid role");
});

export const bookingController = {
  createBooking,getBookings,updateBooking
};
