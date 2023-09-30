import express from "express";
import {
  login,
  register,
  logout,
  refreshToken,
} from "../controllers/auth.controller";
import { validateRequiredFields } from "../middlewares/authMiddelware";
const authRouter = express.Router();

authRouter
  .route("/login")
  .post(validateRequiredFields(["identifier", "password"]), login);
authRouter
  .route("/register")
  .post(validateRequiredFields(["username", "email", "password"]), register);
authRouter.route("/logout").post(logout);
authRouter.route("/refresh-token").post(refreshToken);
export default authRouter;
