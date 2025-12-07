// src/modules/auth/auth.service.ts
import { pool } from "../../database/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config";

type Role = "admin" | "customer";

interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
}

const signupUser = async (payload: SignupPayload) => {
  const { name, email, password, phone, role } = payload;

  const normalizedEmail = email.toLowerCase().trim();
  const hashedPass = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users(name, email, password, phone, role)
     VALUES($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, normalizedEmail, hashedPass, phone, role]
  );

  const user = result.rows[0];

  delete user.password;
  delete user.created_at;
  delete user.updated_at;

  return user;
};

const signinUser = async (email: string, password: string) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email=$1`,
    [email.toLowerCase().trim()]
  );

  if (result.rows.length === 0) {
    // service does NOT throw, just returns null = not found/invalid
    return null;
  }

  const user = result.rows[0];

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    // invalid password → also return null
    return null;
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    config.jwtSecret as string,
    { expiresIn: "7d" }
  );

  delete user.password;
  delete user.created_at;
  delete user.updated_at;

  return { token, user };
};

export const authServices = {
  signupUser,
  signinUser,
};
