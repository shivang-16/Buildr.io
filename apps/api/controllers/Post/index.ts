import { Request, Response, NextFunction } from "express";
import Post from "../../models/postModel";
import User from "../../models/userModel";
import { CustomError } from "../../middlewares/error";
import { uploadToCloudinary, deleteFromCloudinary } from "../../utils/cloudinary";

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
      replyTo: null, // Only top-level posts, not comments
    })
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

// Get single post with comments
export const getPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate("author", "firstname lastname username avatar isVerified");

    if (!post || post.isDeleted) {
      return next(new CustomError("Post not found", 404));
    }

    // Get comments (replies) to this post
    const comments = await Post.find({
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
      comments,
    });
  } catch (error: unknown) {
    next(new CustomError(error instanceof Error ? error.message : "An error occurred"));
  }
};

// Create a new post (or comment)
export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content, replyTo } = req.body;
    const userId = req.user._id;
    const files = req.files as Express.Multer.File[];

    // Validate content
    if (!content || content.trim().length === 0) {
      return next(new CustomError("Post content is required", 400));
    }

    if (content.length > 2000) {
      return next(new CustomError("Post content cannot exceed 2000 characters", 400));
    }

    const postData: any = {
      author: userId,
      content: content.trim(),
      media: [],
    };

    // Upload images to Cloudinary if provided
    if (files && files.length > 0) {
      if (files.length > 4) {
        return next(new CustomError("Cannot upload more than 4 images", 400));
      }

      const uploadPromises = files.map((file) => uploadToCloudinary(file, "posts"));
      const uploadedImages = await Promise.all(uploadPromises);

      postData.media = uploadedImages.map((img) => ({
        type: "image",
        url: img.url,
        publicId: img.publicId,
        width: img.width,
        height: img.height,
      }));
    }

    // If this is a comment, set replyTo
    if (replyTo) {
      const parentPost = await Post.findById(replyTo);
      if (!parentPost || parentPost.isDeleted) {
        return next(new CustomError("Parent post not found", 404));
      }
      postData.replyTo = replyTo;
    }

    const post = await Post.create(postData);

    // If it's a comment, add to parent's replies array
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
      message: replyTo ? "Comment posted successfully" : "Post created successfully",
      post: populatedPost,
    });
  } catch (error: unknown) {
    console.log(error);
    next(new CustomError(error instanceof Error ? error.message : "An error occurred"));
  }
};

// Upvote a post
export const upvotePost = async (
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

    const hasUpvoted = post.upvotes.some(
      (upvoteId) => upvoteId.toString() === userId.toString()
    );

    const hasDownvoted = post.downvotes.some(
      (downvoteId) => downvoteId.toString() === userId.toString()
    );

    if (hasUpvoted) {
      // Remove upvote
      post.upvotes = post.upvotes.filter(
        (upvoteId) => upvoteId.toString() !== userId.toString()
      );
    } else {
      // Add upvote and remove downvote if exists
      if (hasDownvoted) {
        post.downvotes = post.downvotes.filter(
          (downvoteId) => downvoteId.toString() !== userId.toString()
        );
      }
      post.upvotes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: hasUpvoted ? "Upvote removed" : "Post upvoted",
      upvoted: !hasUpvoted,
      upvoteCount: post.upvotes.length,
      downvoteCount: post.downvotes.length,
      score: post.upvotes.length - post.downvotes.length,
    });
  } catch (error: unknown) {
    next(new CustomError(error instanceof Error ? error.message : "An error occurred"));
  }
};

// Downvote a post
export const downvotePost = async (
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

    const hasDownvoted = post.downvotes.some(
      (downvoteId) => downvoteId.toString() === userId.toString()
    );

    const hasUpvoted = post.upvotes.some(
      (upvoteId) => upvoteId.toString() === userId.toString()
    );

    if (hasDownvoted) {
      // Remove downvote
      post.downvotes = post.downvotes.filter(
        (downvoteId) => downvoteId.toString() !== userId.toString()
      );
    } else {
      // Add downvote and remove upvote if exists
      if (hasUpvoted) {
        post.upvotes = post.upvotes.filter(
          (upvoteId) => upvoteId.toString() !== userId.toString()
        );
      }
      post.downvotes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: hasDownvoted ? "Downvote removed" : "Post downvoted",
      downvoted: !hasDownvoted,
      upvoteCount: post.upvotes.length,
      downvoteCount: post.downvotes.length,
      score: post.upvotes.length - post.downvotes.length,
    });
  } catch (error: unknown) {
    next(new CustomError(error instanceof Error ? error.message : "An error occurred"));
  }
};

// Get comments for a post
export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const post = await Post.findById(id);
    if (!post || post.isDeleted) {
      return next(new CustomError("Post not found", 404));
    }

    const comments = await Post.find({
      replyTo: id,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "firstname lastname username avatar isVerified");

    res.status(200).json({
      success: true,
      comments,
      page,
      hasMore: comments.length === limit,
    });
  } catch (error: unknown) {
    next(new CustomError(error instanceof Error ? error.message : "An error occurred"));
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

    // Delete images from Cloudinary
    if (post.media && post.media.length > 0) {
      const deletePromises = post.media.map((media) =>
        deleteFromCloudinary(media.publicId)
      );
      await Promise.all(deletePromises);
    }

    post.isDeleted = true;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error: unknown) {
    next(new CustomError(error instanceof Error ? error.message : "An error occurred"));
  }
};
