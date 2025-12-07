import express, { Request, Response } from "express";
import initDataBase from "./database/db";
import { userRoutes } from "./modules/user/user.route";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { authRoutes } from "./modules/auth/auth.routes";
import { vehicleRoutes } from "./modules/vehicle/vehicle.route";
import { bookingRoutes } from "./modules/booking/booking.route";
import './jobs/bookingCron'


const app = express();

// parser
app.use(express.json());


// initializing DB
initDataBase();

// auth
app.use('/api/v1/users',userRoutes)

// users
app.use('/api/v1/auth',authRoutes)

// vehicles
app.use('/api/v1/vehicles',vehicleRoutes)

// bookings
app.use('/api/v1/bookings',bookingRoutes)

// default root path
app.get('/', (req: Request, res: Response)=> {
    res.status(200).json({
        Message : 'This is root route',
    })
})

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});


// This must be last for other error
app.use(globalErrorHandler);

export default app;
