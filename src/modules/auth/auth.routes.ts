import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

// http://localhost:5000/auth/signup
router.post("/signup", authController.signupUser);
// http://localhost:5000/auth/signin
router.post("/signin", authController.signinUser);

export const authRoutes = router;
