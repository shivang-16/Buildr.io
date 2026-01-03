import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../../models/userModel";
import Post from "../../models/postModel";
import { CustomError } from "../../middlewares/error";
import { createNotification } from "../Notification";

// Get user profile (public)
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;
    
    // Find user by username
    const user = await User.findOne({ username })
      .select("-password -salt -resetPasswordToken -resetTokenExpiry -googleId");
      
    if (!user) {
      return next(new CustomError("User not found", 404));
    }

    // Check if current user is following this profile
    let isFollowing = false;
    if (req.user) {
        // Safe check for followers array
        const followers = user.followers || [];
        isFollowing = followers.includes(req.user._id);
    }

    res.status(200).json({
      success: true,
      user,
      isFollowing,
    });
  } catch (error: unknown) {
    next(new CustomError(error instanceof Error ? error.message : "An error occurred"));
  }
};

// Update User Profile
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const { firstname, lastname, bio, location, website } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new CustomError("User not found", 404));
    }

    // Update fields
    if (firstname) user.firstname = firstname;
    if (lastname !== undefined) user.lastname = lastname;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;

    await user.save();

    res.status(200).json({
      success: true,
      user,
      message: "Profile updated successfully",
    });
  } catch (error: unknown) {
    next(new CustomError(error instanceof Error ? error.message : "An error occurred"));
  }
};

// Get all users (explore) without current user
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const currentUserId = req.user?._id;

    const query: any = {};
    if (currentUserId) {
      query._id = { $ne: currentUserId }; // Exclude current user
    }

    const users = await User.find(query)
      .select("firstname lastname username avatar isVerified bio followers")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Add isFollowing flag for each user
    const usersWithFollowStatus = users.map(user => {
      const userObj = user.toObject();
      const isFollowing = currentUserId ? user.followers.includes(currentUserId) : false;
      return { ...userObj, isFollowing };
    });

    res.status(200).json({
      success: true,
      users: usersWithFollowStatus,
      page,
      hasMore: users.length === limit,
    });
  } catch (error: unknown) {
    next(new CustomError(error instanceof Error ? error.message : "An error occurred"));
  }
};

// Follow/Unfollow user
export const toggleFollow = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params; // ID of user to follow/unfollow
    const currentUserId = req.user._id;

    if (id === currentUserId.toString()) {
      return next(new CustomError("You cannot follow yourself", 400));
    }

    const targetUser = await User.findById(id);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return next(new CustomError("User not found", 404));
    }

    // Ensure arrays exist
    if (!targetUser.followers) targetUser.followers = [];
    if (!currentUser.following) currentUser.following = [];

    const isFollowing = targetUser.followers.includes(currentUserId);

    if (isFollowing) {
      // Unfollow
      targetUser.followers = targetUser.followers.filter(
        (followerId) => followerId.toString() !== currentUserId.toString()
      );
      currentUser.following = currentUser.following.filter(
        (followingId) => followingId.toString() !== id.toString()
      );
    } else {
      // Follow
      targetUser.followers.push(currentUserId);
      currentUser.following.push(targetUser._id);

      await createNotification(id, currentUserId.toString(), "follow");
    }

    await targetUser.save();
    await currentUser.save();

    res.status(200).json({
      success: true,
      message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
      isFollowing: !isFollowing,
    });
  } catch (error: unknown) {
    console.log(error);
    next(new CustomError(error instanceof Error ? error.message : "An error occurred"));
  }
};

// Toggle Bookmark Post
export const toggleBookmark = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return next(new CustomError("Post not found", 404));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new CustomError("User not found", 404));
    }

    // Ensure bookmarks array exists
    if (!user.bookmarks) user.bookmarks = [];

    const isBookmarked = user.bookmarks.some(
      (id) => id.toString() === postId.toString()
    );

    if (isBookmarked) {
      // Remove bookmark
      user.bookmarks = user.bookmarks.filter(
        (id) => id.toString() !== postId.toString()
      );
    } else {
      // Add bookmark
      user.bookmarks.push(post._id);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      isBookmarked: !isBookmarked,
    });
  } catch (error: unknown) {
    next(new CustomError(error instanceof Error ? error.message : "An error occurred"));
  }
};

// Get Bookmarked Posts
export const getBookmarks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: "bookmarks",
      populate: {
        path: "author",
        select: "firstname lastname username avatar isVerified"
      }
    });

    if (!user) {
      return next(new CustomError("User not found", 404));
    }

    // Since bookmarks are an array on user, we need to paginate manually or aggregation
    // For simplicity, let's reverse (newest first) and slice
    // Note: This fetches all bookmarks then slices. For large bookmarks array, aggregation is better.
    // But schema structure is simple array.
    
    // Better: Fetch user, get bookmark IDs, then query Posts
    const bookmarkIds = user.bookmarks;
    const posts = await Post.find({ _id: { $in: bookmarkIds } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "firstname lastname username avatar isVerified");

    res.status(200).json({
      success: true,
      posts,
      page,
      hasMore: posts.length === limit,
    });
  } catch (error: unknown) {
    next(new CustomError(error instanceof Error ? error.message : "An error occurred"));
  }
};

// Get User Posts (Posts or Replies)
export const getUserPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const type = req.query.type as string; // 'posts' | 'replies'
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const query: any = { author: userId, isDeleted: false };

    if (type === "replies") {
      query.replyTo = { $ne: null };
    } else {
      query.replyTo = null; // Default to main posts
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "firstname lastname username avatar isVerified");

    res.status(200).json({
      success: true,
      posts,
      page,
      hasMore: posts.length === limit,
    });
  } catch (error: unknown) {
    next(new CustomError(error instanceof Error ? error.message : "An error occurred"));
  }
};

// Get Followers
export const getFollowers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).populate(
      "followers",
      "firstname lastname username avatar isVerified bio"
    );

    if (!user) {
      return next(new CustomError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      users: user.followers,
    });
  } catch (error: unknown) {
    next(new CustomError(error instanceof Error ? error.message : "An error occurred"));
  }
};

// Get Following
export const getFollowing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).populate(
      "following",
      "firstname lastname username avatar isVerified bio"
    );

    if (!user) {
      return next(new CustomError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      users: user.following,
    });
  } catch (error: unknown) {
    next(new CustomError(error instanceof Error ? error.message : "An error occurred"));
  }
};
