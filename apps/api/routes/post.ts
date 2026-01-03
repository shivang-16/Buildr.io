import express from "express";
import {
  getFeedPosts,
  getPost,
  createPost,
  likePost,
  deletePost,
} from "../controllers/Post";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

// Public routes
router.get("/", getFeedPosts);
router.get("/:id", getPost);

// Protected routes
router.post("/", checkAuth, createPost);
router.post("/:id/like", checkAuth, likePost);
router.delete("/:id", checkAuth, deletePost);

export default router;
