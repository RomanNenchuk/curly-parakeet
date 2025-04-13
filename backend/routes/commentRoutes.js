import express from "express";
import middleware from "../middleware/index.js";

import { setCommentReaction } from "../controllers/emojiController.js";

const router = express.Router();

router.put("/:id/reactions", middleware.decodeToken, setCommentReaction);

export default router;
