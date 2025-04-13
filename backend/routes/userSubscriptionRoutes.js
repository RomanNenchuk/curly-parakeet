import express from "express";
import {
  addSubscription,
  deleteSubscription,
} from "../controllers/userSubscriptionController.js";
const router = express.Router();

router.post("/", addSubscription);

router.delete("/", deleteSubscription);

export default router;
