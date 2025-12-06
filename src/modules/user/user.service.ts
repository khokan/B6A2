import bcrypt from "bcryptjs";
import { pool } from "../../database/db";
import { AppError } from "../../utils/AppError";

const getAllUserIntoDB = async () => {
  const result = await pool.query(
    `SELECT * FROM users ORDER BY id ASC`
  );

  // Remove sensitive fields for ALL returned rows
  const cleanedRows = result.rows.map((row) => {
    delete row.password;
    delete row.created_at;
    delete row.updated_at;
    return row;
  });

  return cleanedRows;
};

const updateUser = async (name: string, email: string, phone: string, role: string, id: number) => {
  const result = await pool.query(
    `UPDATE users SET name=$1, email=$2, phone=$3, role=$4 WHERE id=$5 RETURNING *`,
    [name, email, phone, role, id]
  );

    delete result.rows[0].password
    delete result.rows[0].created_at
    delete result.rows[0].updated_at

  return result.rows;
};

const deleteUser = async (id: number) => {

  
    // 1️⃣ First check if user exists
  const existing = await pool.query(
    `SELECT id, name, email, phone, role 
     FROM users 
     WHERE id = $1`,
    [id]
  );

  if (existing.rowCount === 0) {
    return null; // controller will send 404
  }

  const result = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);

  return result;
};


export const userService = {
  getAllUserIntoDB, updateUser, deleteUser
};
