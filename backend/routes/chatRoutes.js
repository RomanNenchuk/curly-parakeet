import express from "express";
import {
  getChatList,
  fetchOrCreateChat,
  deleteChat,
  clearChat,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/", getChatList);

router.delete("/:id/messages", clearChat);

router.put("/:id", fetchOrCreateChat);

router.delete("/:id", deleteChat);

export default router;
