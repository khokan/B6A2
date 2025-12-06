// src/services/booking.service.ts

import { pool } from "../../database/db";


export type BookingStatus = "active" | "cancelled" | "returned";

export interface CreateBookingInput {
  customerId: number;
  vehicleId: number;
  rentStartDate: string; // 'YYYY-MM-DD'
  rentEndDate: string;   // 'YYYY-MM-DD'
}

export const createBooking = async (payload: CreateBookingInput) => {
  const { customerId, vehicleId, rentStartDate, rentEndDate } = payload;

  // 1️⃣ Get vehicle & ensure available
  const vehicleResult = await pool.query(
    `
    SELECT id, daily_rent_price, availability_status
    FROM vehicles
    WHERE id = $1;
    `,
    [vehicleId]
  );

  if (vehicleResult.rowCount === 0) {
    throw new Error("Vehicle not found");
  }

  const vehicle = vehicleResult.rows[0];

  if (vehicle.availability_status !== "available") {
    throw new Error("Vehicle is not available for booking");
  }

  // 2️⃣ Compute rental days and total_price
  const start = new Date(rentStartDate);
  const end = new Date(rentEndDate);

  const diffMs = end.getTime() - start.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);

  if (days <= 0) {
    throw new Error("rent_end_date must be after rent_start_date");
  }

  const totalPrice = days * Number(vehicle.daily_rent_price);

  // 3️⃣ Insert booking
  const bookingResult = await pool.query(
    `
    INSERT INTO bookings (
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
      total_price,
      status
    )
    VALUES ($1, $2, $3, $4, $5, 'active')
    RETURNING
      id,
      customer_id        AS "customerId",
      vehicle_id         AS "vehicleId",
      rent_start_date    AS "rentStartDate",
      rent_end_date      AS "rentEndDate",
      total_price        AS "totalPrice",
      status;
    `,
    [customerId, vehicleId, rentStartDate, rentEndDate, totalPrice]
  );

  // 4️⃣ Mark vehicle as booked
  await pool.query(
    `
    UPDATE vehicles
    SET availability_status = 'booked', updated_at = NOW()
    WHERE id = $1;
    `,
    [vehicleId]
  );

  return bookingResult.rows[0];
};

export const getAllBookings = async () => {
  const result = await pool.query(
    `
    SELECT
      id,
      customer_id      AS "customerId",
      vehicle_id       AS "vehicleId",
      rent_start_date  AS "rentStartDate",
      rent_end_date    AS "rentEndDate",
      total_price      AS "totalPrice",
      status
    FROM bookings
    ORDER BY id ASC;
    `
  );

  return result.rows;
};

export const getBookingById = async (id: number) => {
  const result = await pool.query(
    `
    SELECT
      id,
      customer_id      AS "customerId",
      vehicle_id       AS "vehicleId",
      rent_start_date  AS "rentStartDate",
      rent_end_date    AS "rentEndDate",
      total_price      AS "totalPrice",
      status
    FROM bookings
    WHERE id = $1;
    `,
    [id]
  );

  return result.rows[0] || null;
};

export const updateBookingStatus = async (id: number, status: BookingStatus) => {
  // Get booking to know vehicle_id
  const bookingResult = await pool.query(
    `
    SELECT id, vehicle_id, status
    FROM bookings
    WHERE id = $1;
    `,
    [id]
  );

  if (bookingResult.rowCount === 0) {
    return null;
  }

  const booking = bookingResult.rows[0];

  // Update booking status
  const updatedResult = await pool.query(
    `
    UPDATE bookings
    SET status = $1
    WHERE id = $2
    RETURNING
      id,
      customer_id      AS "customerId",
      vehicle_id       AS "vehicleId",
      rent_start_date  AS "rentStartDate",
      rent_end_date    AS "rentEndDate",
      total_price      AS "totalPrice",
      status;
    `,
    [status, id]
  );

  // If booking is no longer active, free the vehicle
  if (status === "cancelled" || status === "returned") {
    await pool.query(
      `
      UPDATE vehicles
      SET availability_status = 'available', updated_at = NOW()
      WHERE id = $1;
      `,
      [booking.vehicle_id]
    );
  }

  return updatedResult.rows[0];
};

export const deleteBooking = async (id: number) => {
  const result = await pool.query(
    `
    DELETE FROM bookings
    WHERE id = $1
    RETURNING
      id,
      customer_id      AS "customerId",
      vehicle_id       AS "vehicleId",
      rent_start_date  AS "rentStartDate",
      rent_end_date    AS "rentEndDate",
      total_price      AS "totalPrice",
      status;
    `,
    [id]
  );

  if (result.rowCount === 0) return null;

  return result.rows[0];
};

// Helpers used by User / Vehicle modules:
const userHasActiveBookings = async (userId: number): Promise<boolean> => {
  const result = await pool.query(
    `
    SELECT 1 FROM bookings
    WHERE customer_id = $1 AND status = 'active'
    LIMIT 1;
    `,
    [userId]
  );
  return result.rowCount! > 0;
};
 
const vehicleHasActiveBookings = async (vehicleId: number): Promise<boolean> => {
  const result = await pool.query(
    `
    SELECT 1 FROM bookings
    WHERE vehicle_id = $1 AND status = 'active'
    LIMIT 1;
    `,
    [vehicleId]
  );
  return result.rowCount! > 0;
};

export const bookingService = {
  createBooking, getAllBookings, getBookingById, updateBookingStatus, deleteBooking, vehicleHasActiveBookings,userHasActiveBookings
};
