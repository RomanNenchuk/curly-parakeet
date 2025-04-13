import express from "express";
import middleware from "../middleware/index.js";

import { saveAttachments } from "../controllers/fileController.js";
import { saveImage, deleteAvatar } from "../controllers/fileController.js";

const router = express.Router();

router.post("/:id/profile-image", middleware.decodeToken, saveImage);

router.delete("/:id/profile-image", middleware.decodeToken, deleteAvatar);

router.post("/:id/topic-screensaver", middleware.decodeToken, saveImage);

router.post("/:id", saveAttachments);

export default router;
