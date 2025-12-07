import cron from "node-cron";
import { bookingService } from "../modules/booking/booking.service";

// Runs every night at 12:00 AM
cron.schedule("0 0 * * *", async () => {
  console.log("Running auto-return job...");

  try {
    await bookingService.autoReturnFinishedBookings();
    console.log("Auto-return completed: expired bookings are now marked returned.");
  } catch (err) {
    console.error("Error running auto-return job:", err);
  }
});
