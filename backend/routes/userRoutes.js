import express from "express";
import middleware from "../middleware/index.js";

import {
  saveUser,
  updateUser,
  getUserInfo,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/", middleware.decodeToken, saveUser);

router.put("/:id", middleware.decodeToken, updateUser);

router.get("/:id", getUserInfo);

export default router;
