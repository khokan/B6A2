import { Router } from "express";
import auth from "../../middleware/auth";
import { bookingController } from "./booking.controller";

const router = Router();

// Customer/Admin can create booking (using own user id)
router.post("/", auth("admin", "customer"), bookingController.createBooking);

// Admin only - view all bookings
router.get("/", auth("admin"), bookingController.getAllBookings);

// Admin or logged-in user – your choice
router.get("/:bookingId", auth("admin", "customer"), bookingController.getBookingById);

// Admin can update status (or you allow customer to cancel own booking)
router.patch("/:bookingId/status", auth("admin"), bookingController.updateBookingStatus);

// Admin only - delete non-active bookings
router.delete("/:bookingId", auth("admin"), bookingController.deleteBooking);

export default router;
