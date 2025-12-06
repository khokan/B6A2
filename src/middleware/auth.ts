import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { pool } from "../database/db";
import config from "../config";
import { sendError } from "../utils/sendError";

interface DecodedUser extends JwtPayload {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer";
}

const auth = (...roles: ("admin" | "customer")[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      // 1️⃣ Check header exists
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return sendError(res, 401, "Unauthorized: Token missing");
      }

      // 2️⃣ Extract token
      const token = authHeader.split(" ")[1];

      let decoded: DecodedUser;
      try {
       decoded = jwt.verify(token as string, config.jwtSecret!) as DecodedUser;
      } catch {
        return sendError(res, 401, "Unauthorized: Invalid or expired token");
      }

      // 3️⃣ Make sure user still exists
      const user = await pool.query(
        `SELECT id, name, email, role FROM users WHERE id=$1`,
        [decoded.id]
      );

      if (user.rows.length === 0) {
        return sendError(res, 401, "Unauthorized: User has been removed");
      }

      // 4️⃣ Attach user to request
      req.user = user.rows[0];

      // 5️⃣ Role-based access check
      if (roles.length > 0 && !roles.includes(req.user!.role)) {
        return sendError(res, 403, "Forbidden: Insufficient permissions");
      }

      next();
    } catch (error) {
      return sendError(res, 500, "Authentication failed", error);
    }
  };
};

export default auth;
