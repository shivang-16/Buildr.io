import { Router } from "express";
import {
  getProfile,
  getAllUsers,
  toggleFollow,
  toggleBookmark,
  getBookmarks,
  getUserPosts,
  getFollowers,
  getFollowing,
  updateProfile,
} from "../controllers/User";
import { checkAuth } from "../middlewares/checkAuth";

const router: Router = Router();

// Public routes (though some info might be limited)
router.get("/profile/:username", getProfile);
router.get("/:userId/posts", getUserPosts);
router.get("/:userId/followers", getFollowers);
router.get("/:userId/following", getFollowing);

// Protected routes
router.use(checkAuth);

router.get("/", getAllUsers); // Explore users
router.put("/profile", updateProfile); // Update profile
router.post("/:id/follow", toggleFollow);
router.post("/bookmark/:postId", toggleBookmark);
router.get("/bookmarks", getBookmarks);

export default router;
