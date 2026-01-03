import { Request, Response, NextFunction } from "express";
import Post from "../../models/postModel";
import User from "../../models/userModel";
import { CustomError } from "../../middlewares/error";

// Get feed posts
export const getFeedPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const posts = await Post.find({
      isDeleted: false,
      replyTo: null, // Only top-level posts, not replies
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "firstname lastname username avatar isVerified")
      .populate({
        path: "quotedPost",
        populate: { path: "author", select: "firstname lastname username avatar" },
      });

    res.status(200).json({
      success: true,
      posts,
      page,
      hasMore: posts.length === limit,
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

// Get single post with replies
export const getPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate("author", "firstname lastname username avatar isVerified")
      .populate({
        path: "quotedPost",
        populate: { path: "author", select: "firstname lastname username avatar" },
      });

    if (!post || post.isDeleted) {
      return next(new CustomError("Post not found", 404));
    }

    // Get replies to this post
    const replies = await Post.find({
      replyTo: id,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .populate("author", "firstname lastname username avatar isVerified");

    // Increment view count
    post.viewCount += 1;
    await post.save();

    res.status(200).json({
      success: true,
      post,
      replies,
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

// Create a new post (or reply)
export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content, replyTo } = req.body;
    const userId = req.user._id;

    if (!content || content.trim().length === 0) {
      return next(new CustomError("Post content is required", 400));
    }

    if (content.length > 280) {
      return next(new CustomError("Post content cannot exceed 280 characters", 400));
    }

    const postData: any = {
      author: userId,
      content: content.trim(),
    };

    // If this is a reply, set replyTo
    if (replyTo) {
      const parentPost = await Post.findById(replyTo);
      if (!parentPost || parentPost.isDeleted) {
        return next(new CustomError("Parent post not found", 404));
      }
      postData.replyTo = replyTo;
    }

    const post = await Post.create(postData);

    // If it's a reply, add to parent's replies array
    if (replyTo) {
      await Post.findByIdAndUpdate(replyTo, {
        $push: { replies: post._id },
      });
    }

    const populatedPost = await Post.findById(post._id).populate(
      "author",
      "firstname lastname username avatar isVerified"
    );

    res.status(201).json({
      success: true,
      message: replyTo ? "Reply posted successfully" : "Post created successfully",
      post: populatedPost,
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

// Like/unlike a post
export const likePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post || post.isDeleted) {
      return next(new CustomError("Post not found", 404));
    }

    const isLiked = post.likes.some(
      (likeId) => likeId.toString() === userId.toString()
    );

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(
        (likeId) => likeId.toString() !== userId.toString()
      );
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: isLiked ? "Post unliked" : "Post liked",
      liked: !isLiked,
      likeCount: post.likes.length,
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

// Delete a post
export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return next(new CustomError("Post not found", 404));
    }

    if (post.author.toString() !== userId.toString()) {
      return next(new CustomError("Not authorized to delete this post", 403));
    }

    post.isDeleted = true;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};
