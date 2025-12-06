import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/sendError";

export const allowAdminOrOwn = (req: Request, res: Response, next: NextFunction) => {
  const currentUser = req.user;
  const targetId = Number(req.params.userId);

  if (!currentUser) {
    return sendError(res, 401, "Unauthorized");
  }

  if (!targetId || Number.isNaN(targetId)) {
    return sendError(res, 400, "Invalid user ID");
  }

  // Admin can modify anybody
  if (currentUser.role === "admin") {
    return next();
  }

  // Customer can only modify their own profile
  if (currentUser.id === targetId) {
    return next();
  }

  return sendError(res, 403, "Forbidden: You cannot modify another user's data");
};
