import { Request, Response } from "express";
import { authServices } from "./auth.service";
import { sendSuccess } from "../../utils/sendSuccess";
import { catchAsync } from "../../utils/catchAsync";


const signupUser = catchAsync(async (req: Request, res: Response) => {

    const result = await authServices.signupUser(req.body);
    // console.log(result.rows[0]);
    return sendSuccess(res, result, 201, "User registered successfully");

});

const signinUser = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await authServices.signinUser(email, password);

    return sendSuccess(res, result, 200, "Login successful");

});

export const authController = {
  signinUser,signupUser
};
