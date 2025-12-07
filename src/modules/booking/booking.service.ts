// src/services/booking.service.ts
import { pool } from "../../database/db";


export type BookingStatus = "active" | "cancelled" | "returned";

export interface CreateBookingInput {
  customerId: number;
  vehicleId: number;
  rentStartDate: string; // 'YYYY-MM-DD'
  rentEndDate: string;   // 'YYYY-MM-DD'
}

// Create booking: validates vehicle & calculates total price
const createBooking = async (payload: CreateBookingInput) => {
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

  // 2️⃣ Compute rental days and total price
  const start = new Date(rentStartDate);
  const end = new Date(rentEndDate);

  const diffMs = end.getTime() - start.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);

  if (days <= 0) {
    throw new Error("rent_end_date must be after rent_start_date");
  }

  const totalPrice = days * Number(vehicle.daily_rent_price);


  // 3️⃣ Insert booking as 'active'
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
      customer_id ,
      vehicle_id ,
      DATE(rent_start_date)::TEXT,
      DATE(rent_end_date)::TEXT,
      total_price::INTEGER,
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

// Admin: all bookings
const getAllBookings = async () => {
  const result = await pool.query(
    `
    SELECT 
      b.id,
      b.customer_id,
      b.vehicle_id,
     DATE(b.rent_start_date)::TEXT,
      DATE(b.rent_end_date)::TEXT,
      b.total_price::INTEGER,
      b.status,

      u.name AS customer_name,
      u.email AS customer_email,

      v.vehicle_name,
      v.registration_number

    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    JOIN vehicles v ON b.vehicle_id = v.id
    ORDER BY b.id ASC;
    `
  );

// Format the nested structure EXACTLY as you want
  return result.rows.map((row) => ({
    id: row.id,
    customer_id: row.customer_id,
    vehicle_id: row.vehicle_id,
    rent_start_date: row.rent_start_date,
    rent_end_date: row.rent_end_date,
    total_price: row.total_price,
    status: row.status,

   customer: {
    name: row.customer_name,
    email: row.customer_email,
  },

  vehicle: {
    vehicle_name: row.vehicle_name,
    registration_number: row.registration_number,
  },
  }));
};

// Customer: own bookings
const getBookingsByCustomer = async (customerId: number) => {
  const result = await pool.query(
      `
   SELECT
      b.id,
      b.vehicle_id,
      DATE(b.rent_start_date)::TEXT AS rent_start_date,
      DATE(b.rent_end_date)::TEXT   AS rent_end_date,
      b.total_price::INTEGER        AS total_price,
      b.status,

      v.vehicle_name,
      v.registration_number,
      v.type

    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.customer_id = $1
    ORDER BY b.id ASC;
    `,
    [customerId]
  );

   return result.rows.map((row) => ({
    id: row.id,
    vehicle_id: row.vehicle_id,
    rent_start_date: row.rent_start_date,
    rent_end_date: row.rent_end_date,
    total_price: row.total_price,
    status: row.status,

    // Nested vehicle object
    vehicle: {
      vehicle_name: row.vehicle_name,
      registration_number: row.registration_number,
      type: row.type,
    },
  }));
};

const getBookingById = async (id: number) => {
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

// Customer cancel (only before start date, only own booking, only if active)
const cancelBookingByCustomer = async (bookingId: number, customerId: number) => {
  const booking = await getBookingById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.customerId !== customerId) {
    throw new Error("You are not allowed to cancel this booking");
  }

  if (booking.status !== "active") {
    throw new Error("Only active bookings can be cancelled");
  }

  const now = new Date();
  const startDate = new Date(booking.rentStartDate);

  if (now >= startDate) {
    throw new Error("Booking can only be cancelled before start date");
  }

  // Update booking status
  const result = await pool.query(
    `
    UPDATE bookings
    SET status = 'cancelled'
    WHERE id = $1
    RETURNING
      id,
      customer_id,
      vehicle_id,
      DATE(rent_start_date)::TEXT AS rent_start_date,
      DATE(rent_end_date)::TEXT AS rent_end_date,
      total_price::INTEGER AS total_price,
      status;
    `,
    [bookingId]
  );

  // Free vehicle
  await pool.query(
    `
    UPDATE vehicles
    SET availability_status = 'available', updated_at = NOW()
    WHERE id = $1;
    `,
    [booking.vehicleId]
  );

  return result.rows[0];
};

// Admin marks booking as returned (frees vehicle)
 const markBookingReturnedByAdmin = async (bookingId: number) => {
  const booking = await getBookingById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== "active") {
    throw new Error("Only active bookings can be marked as returned");
  }

  const bookingResult = await pool.query(
    `
    UPDATE bookings
    SET status = 'returned'
    WHERE id = $1
    RETURNING
      id,
      customer_id,
      vehicle_id,
       DATE(rent_start_date)::TEXT AS rent_start_date,
       DATE(rent_end_date)::TEXT AS rent_end_date,
      total_price::INTEGER AS total_price,
      status;
    `,
    [bookingId]
  );

  // Free vehicle
  const vehicleResult = await pool.query(
    `
    UPDATE vehicles
    SET availability_status = 'available', updated_at = NOW()
    WHERE id = $1
    RETURNING availability_status;
    `,
    [booking.vehicleId]
  );

  return {
    ...bookingResult.rows[0], vehicle: vehicleResult.rows[0]
  }
};

// For user/vehicle delete checks
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

// (Optional) System job: auto-return after end date
 const autoReturnFinishedBookings = async () => {
  // Mark all active bookings whose rent_end_date < today as returned
  await pool.query(
    `
    WITH updated AS (
      UPDATE bookings
      SET status = 'returned'
      WHERE status = 'active'
        AND rent_end_date < CURRENT_DATE
      RETURNING vehicle_id
    )
    UPDATE vehicles v
    SET availability_status = 'available', updated_at = NOW()
    FROM updated u
    WHERE v.id = u.vehicle_id;
    `
  );
};

export const bookingService = {
  createBooking, getAllBookings, getBookingsByCustomer, getBookingById, cancelBookingByCustomer,markBookingReturnedByAdmin,
  userHasActiveBookings, vehicleHasActiveBookings, autoReturnFinishedBookings
};