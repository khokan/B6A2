import express, { Request, Response } from "express";
import initDataBase from "./database/db";
import { userRoutes } from "./modules/user/user.route";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { AppError } from "./utils/AppError";
import { HTTP } from "./utils/httpStatus";


const app = express();

// parser
app.use(express.json());


// initializing DB
initDataBase();

// Users
app.use('/api/v1/users',userRoutes)


// "/" -> localhost:5000/
app.get('/', (req: Request, res: Response)=> {
    res.status(200).json({
        Message : 'This is root route',
        path: '/'
    })
})

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});


export default app;
