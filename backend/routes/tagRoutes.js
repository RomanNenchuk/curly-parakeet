import express from "express";
import { getTagList } from "../controllers/tagController.js";

const router = express.Router();

router.get("/", getTagList);

export default router;
