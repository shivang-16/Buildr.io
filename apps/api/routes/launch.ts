import express from "express";
import {
  createLaunch,
  getLaunches,
  toggleUpvote,
  checkCanLaunch,
} from "../controllers/launch";
import { checkAuth } from "../middlewares/checkAuth";

import { upload } from "../middlewares/upload";

const router: express.Router = express.Router();

// Get launches by date
router.get("/", getLaunches);

// Create a launch (protected)
router.post(
  "/",
  checkAuth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  createLaunch
);

// Check if user can launch today (protected)
router.get("/can-launch", checkAuth, checkCanLaunch);

// Toggle upvote (protected)
router.post("/:launchId/upvote", checkAuth, toggleUpvote);

export default router;
