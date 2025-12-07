// src/services/vehicle.service.ts

import { pool } from "../../database/db";


export type VehicleType = "car" | "bike" | "van" | "SUV";
export type AvailabilityStatus = "available" | "booked";

export interface CreateVehicleInput {
  vehicleName: string;
  type: VehicleType;
  registrationNumber: string;
  dailyRentPrice: number;
  availabilityStatus: AvailabilityStatus;
}

export interface UpdateVehicleInput {
  vehicleName?: string;
  type?: VehicleType;
  registrationNumber?: string;
  dailyRentPrice?: number;
  availabilityStatus?: AvailabilityStatus;
}

// Create
export const createVehicle = async (payload: CreateVehicleInput) => {
  const { vehicleName, type, registrationNumber, dailyRentPrice, availabilityStatus } = payload;

  const result = await pool.query(
    `
    INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING 
      id,
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status;
    `,
    [vehicleName, type, registrationNumber, dailyRentPrice, availabilityStatus]
  );

  return result.rows[0];
};

// Get all
export const getAllVehicles = async () => {
  const result = await pool.query(
    `
    SELECT
      id,
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status
    FROM vehicles
    ORDER BY id ASC;
    `
  );

  return result.rows;
};

// Get one
export const getVehicleById = async (id: number) => {
  const result = await pool.query(
    `
    SELECT
      id,
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status
    FROM vehicles
    WHERE id = $1;
    `,
    [id]
  );

  return result.rows[0] || null;
};

// Update (partial)
export const updateVehicle = async (id: number, payload: UpdateVehicleInput) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) {
      // map TS field name to DB column name
      let column: string;
      switch (key) {
        case "vehicleName":
          column = "vehicle_name";
          break;
        case "registrationNumber":
          column = "registration_number";
          break;
        case "dailyRentPrice":
          column = "daily_rent_price";
          break;
        case "availabilityStatus":
          column = "availability_status";
          break;
        default:
          column = key;
      }

      fields.push(`${column} = $${idx}`);
      values.push(value);
      idx++;
    }
  }

  if (fields.length === 0) {
    return null; // nothing to update
  }

  values.push(id);

  const result = await pool.query(
    `
    UPDATE vehicles
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${idx}
    RETURNING
      id,
      vehicle_name,
      type,
      registration_number,
      daily_rent_price::integer,
      availability_status;
    `,
    values
  );

  if (result.rows.length === 0) return null;
  return result.rows[0];
};

// Delete (just delete here; booking check in controller)
export const deleteVehicle = async (id: number) => {
  const result = await pool.query(
    `
    DELETE FROM vehicles
    WHERE id = $1
    RETURNING
      id,
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status;
    `,
    [id]
  );

  if (result.rows.length === 0) return null;
  return result.rows[0];
};

export const vehicleService = {
  createVehicle, updateVehicle, deleteVehicle, getAllVehicles, getVehicleById
};
