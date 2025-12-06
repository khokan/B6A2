import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendError } from "../../utils/sendError";
import { vehicleService } from "./vehicle.service";
import { sendSuccess } from "../../utils/sendSuccess";
import { bookingService } from "../booking/booking.service";
import { UpdateVehicleInput } from "./vehicle.service";

// POST /api/v1/vehicles  (admin only)
export const createVehicle = catchAsync(async (req: Request, res: Response) => {
  const {  vehicle_name:vehicleName, type, 
registration_number:registrationNumber, 
daily_rent_price:dailyRentPrice, 
availability_status:availabilityStatus } = req.body;

  if (!vehicleName || !type || !registrationNumber || !dailyRentPrice || !availabilityStatus) {
    return sendError(res, 400, "All fields are required");
  }

  if (!["car", "bike", "van", "SUV"].includes(type)) {
    return sendError(res, 400, "Invalid vehicle type");
  }

  if (!["available", "booked"].includes(availabilityStatus)) {
    return sendError(res, 400, "Invalid availability status");
  }

  if (Number(dailyRentPrice) <= 0) {
    return sendError(res, 400, "Daily rent price must be positive");
  }

  const vehicle = await vehicleService.createVehicle({
    vehicleName,
    type,
    registrationNumber,
    dailyRentPrice: Number(dailyRentPrice),
    availabilityStatus,
  });

  return sendSuccess(res, vehicle, 201, "Vehicle created successfully");
});

// GET /api/v1/vehicles (public)
export const getAllVehicles = catchAsync(async (req: Request, res: Response) => {
  const vehicles = await vehicleService.getAllVehicles();
  return sendSuccess(res, vehicles, 200, "Vehicles retrieved successfully");
});

// GET /api/v1/vehicles/:vehicleId (public)
export const getVehicleById = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.vehicleId);

  if (!id || Number.isNaN(id)) {
    return sendError(res, 400, "Invalid vehicle ID");
  }

  const vehicle = await vehicleService.getVehicleById(id);

  if (!vehicle) {
    return sendError(res, 404, "Vehicle not found");
  }

  return sendSuccess(res, vehicle, 200, "Vehicle retrieved successfully");
});

// PUT /api/v1/vehicles/:vehicleId (admin only)
export const updateVehicle = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.vehicleId);

  if (!id || Number.isNaN(id)) {
    return sendError(res, 400, "Invalid vehicle ID");
  }

  const { vehicle_name, type, registration_number, daily_rent_price, 
availability_status } = req.body;

  if (
    !vehicle_name &&
    !type &&
    !registration_number &&
    daily_rent_price === undefined &&
    !availability_status
  ) {
    return sendError(res, 400, "At least one field is required to update vehicle");
  }

  if (type && !["car", "bike", "van", "SUV"].includes(type)) {
    return sendError(res, 400, "Invalid vehicle type");
  }

  if (availability_status && !["available", "booked"].includes(availability_status)) {
    return sendError(res, 400, "Invalid availability status");
  }

  if (daily_rent_price !== undefined && Number(daily_rent_price) <= 0) {
    return sendError(res, 400, "Daily rent price must be positive");
  }

  const payload: UpdateVehicleInput = {};

  if (vehicle_name) payload.vehicleName = vehicle_name;
  if (type) payload.type = type;
  if (registration_number) payload.registrationNumber = registration_number;
  if (daily_rent_price !== undefined) payload.dailyRentPrice = Number(daily_rent_price);
  if (availability_status) payload.availabilityStatus = availability_status;

  const updated = await vehicleService.updateVehicle(id, payload);

  if (!updated) {
    return sendError(res, 404, "Vehicle not found");
  }

  return sendSuccess(res, updated, 200, "Vehicle updated successfully");
});

// DELETE /api/v1/vehicles/:vehicleId (admin only, no active bookings)
export const deleteVehicle = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.vehicleId);

  if (!id || Number.isNaN(id)) {
    return sendError(res, 400, "Invalid vehicle ID");
  }

  // Check if there are active bookings
  const hasActive = await bookingService.vehicleHasActiveBookings(id);

  if (hasActive) {
    return sendError(
      res,
      400,
      "Vehicle cannot be deleted while active bookings exist"
    );
  }

  const deleted = await vehicleService.deleteVehicle(id);

  if (!deleted) {
    return sendError(res, 404, "Vehicle not found");
  }

  return sendSuccess(res, null, 200, "Vehicle deleted successfully");
});


export const vehicleController = {
  getAllVehicles,getVehicleById,createVehicle,updateVehicle,deleteVehicle
};
