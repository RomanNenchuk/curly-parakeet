import express from "express";
import middleware from "../middleware/index.js";

import {
  getTopicsPreview,
  getTopic,
  postNewComment,
  deleteComment,
  editComments,
  deleteTopic,
  getUserTopic,
  switchTopicToUser,
  getIsTopicSaved,
  getSavedTopics,
  getPopularTopics,
} from "../controllers/topicController.js";

import { getTopicComments } from "../controllers/commentController.js";

import { setTopicReaction } from "../controllers/emojiController.js";

import { saveTopic, uploadFiles } from "../controllers/saveTopicController.js";

const router = express.Router();

router.get("/", getTopicsPreview);

router.post("/", uploadFiles, saveTopic);

router.post("/comments", postNewComment);

router.get("/mytopics", getUserTopic);

router.get("/:id/comments", getTopicComments);

router.put("/:id/reactions", middleware.decodeToken, setTopicReaction);

router.get("/save", getIsTopicSaved);

router.get("/saved", getSavedTopics);

router.get("/popular", getPopularTopics);

router.get("/:id", getTopic);

router.delete("/comments/:id", deleteComment);

router.patch("/comments/:id", editComments);

router.delete("/:id", deleteTopic);

router.patch("/switch", switchTopicToUser);

export default router;
