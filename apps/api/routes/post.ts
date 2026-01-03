import express, { Router } from "express";
import {
  getFeedPosts,
  getPost,
  createPost,
  upvotePost,
  downvotePost,
  getComments,
  deletePost,
} from "../controllers/Post";
import { checkAuth } from "../middlewares/checkAuth";
import { upload } from "../middlewares/upload";

const router: Router = Router();

// Public routes
router.get("/", getFeedPosts);
router.get("/:id", getPost);
router.get("/:id/comments", getComments);

// Protected routes
router.post("/", checkAuth, upload.array("images", 4), createPost);
router.post("/:id/upvote", checkAuth, upvotePost);
router.post("/:id/downvote", checkAuth, downvotePost);
router.delete("/:id", checkAuth, deletePost);

export default router;
