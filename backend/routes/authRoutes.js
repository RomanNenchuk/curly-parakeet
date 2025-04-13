import express from "express";
import {
  checkUserRegistration,
  checkUsername,
  checkUsernameOrEmail,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/check-registration/:id", checkUserRegistration);

router.get("/check-username/:username", checkUsername);

router.get("/verify-username-email", checkUsernameOrEmail);

export default router;
