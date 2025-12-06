import { Router } from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";
import { allowAdminOrOwn } from "../../middleware/allowAdminOrOwn";

const router = Router();

router.get("/", auth('admin'), userController.getAllUser);
router.put("/:userId",auth('admin', "customer"), allowAdminOrOwn, userController.updateUser);
router.delete("/:userId",auth('admin'), userController.deleteUser);
export const userRoutes = router;
