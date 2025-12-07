import { Router } from "express";
import auth from "../../middleware/auth";
import { bookingController } from "./booking.controller";


const router = Router();

// POST /api/v1/bookings - Customer or Admin
router.post("/", auth("admin", "customer"), bookingController.createBooking);

// GET /api/v1/bookings - Role-based
router.get("/", auth("admin", "customer"), bookingController.getBookings);

// PUT /api/v1/bookings/:bookingId - Role-based
router.put("/:bookingId", auth("admin", "customer"), bookingController.updateBooking);

export const bookingRoutes = router;
