import express from "express";
import User from "../models/userModel";
import { CustomError } from "../middlewares/error";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

// Get user by username
router.get("/:username", async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ 
      $or: [
        { username },
        { email: username },
        { firstname: { $regex: new RegExp(`^${username}$`, 'i') } }
      ]
    }).select("-password -salt -resetPasswordToken -resetTokenExpiry");

    if (!user) {
      return next(new CustomError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
});

// Follow/unfollow user
router.post("/:userId/follow", checkAuth, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return next(new CustomError("Cannot follow yourself", 400));
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return next(new CustomError("User not found", 404));
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return next(new CustomError("Current user not found", 404));
    }

    const isFollowing = currentUser.following?.includes(userId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following?.filter(
        (id: any) => id.toString() !== userId
      );
      userToFollow.followers = userToFollow.followers?.filter(
        (id: any) => id.toString() !== currentUserId.toString()
      );
    } else {
      // Follow
      if (!currentUser.following) currentUser.following = [];
      if (!userToFollow.followers) userToFollow.followers = [];
      currentUser.following.push(userId);
      userToFollow.followers.push(currentUserId);
    }

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({
      success: true,
      message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
      isFollowing: !isFollowing,
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
});

export default router;
