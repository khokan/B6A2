import { pool } from "../../database/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config";
import { sendError } from "../../utils/sendError";
import { AppError } from "../../utils/AppError";
import { HTTP } from "../../utils/httpStatus";

const signupUser = async (payload: Record<string, unknown>) => {
   const { name, email, password, phone, role } = payload;

   if (!(email as string).includes("@")) {
      throw new AppError("Invalid email format", 400);
  }

   if (!["admin", "customer"].includes(role as string)) {
      throw new AppError("Role must be admin or customer", 400);
    }

  if ((password as string).length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  const normalizedEmail = (email as string).toLowerCase().trim();

   const hashedPass = await bcrypt.hash(password as string, 10);

   const result = await pool.query(
    `INSERT INTO users(name, email, password, phone, role) VALUES($1, $2, $3, $4, $5) RETURNING *`,
   [name, normalizedEmail, hashedPass, phone, role]
  );

   const user = result.rows[0];

   delete user.password
   delete user.created_at
   delete user.updated_at

  return user;
};

const signinUser = async (email: string, password: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);

  if (result.rows.length === 0) {
     throw new AppError("User not found", HTTP.NOT_FOUND);
  }
  const user = result.rows[0];

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new AppError("password failed", HTTP.UNAUTHORIZED);
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    config.jwtSecret as string,
    {
      expiresIn: "7d",
    }
  );

    delete user.password
    delete user.created_at
    delete user.updated_at

  return { token, user };
};

export const authServices = {
  signinUser,signupUser
};
