import mongoose, { Document, Schema, Model } from "mongoose";

// Interface for embedded media in posts
interface IMedia {
  type: "image";
  url: string;
  publicId: string; // Cloudinary public ID for deletion
  altText?: string;
  width?: number;
  height?: number;
}

// Interface for Post document
export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  media: IMedia[];
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  replies: mongoose.Types.ObjectId[];
  replyTo: mongoose.Types.ObjectId | null; // If this post is a comment/reply
  hashtags: string[];
  mentions: mongoose.Types.ObjectId[];
  viewCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Post model (static methods)
export interface IPostModel extends Model<IPost> {
  findByAuthor(authorId: mongoose.Types.ObjectId): Promise<IPost[]>;
  findFeedForUser(userId: mongoose.Types.ObjectId, page: number, limit: number): Promise<IPost[]>;
}

const mediaSchema = new Schema<IMedia>(
  {
    type: {
      type: String,
      enum: ["image"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    altText: {
      type: String,
      maxlength: [500, "Alt text cannot exceed 500 characters"],
    },
    width: Number,
    height: Number,
  },
  { _id: false }
);

const postSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
      index: true,
    },
    content: {
      type: String,
      maxlength: [2000, "Post content cannot exceed 2000 characters"],
      default: "",
    },
    media: {
      type: [mediaSchema],
      validate: {
        validator: function (v: IMedia[]) {
          return v.length <= 4;
        },
        message: "Cannot attach more than 4 media items to a post",
      },
      default: [],
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null,
      index: true,
    },
    hashtags: {
      type: [String],
      default: [],
      index: true,
    },
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    viewCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ hashtags: 1, createdAt: -1 });
postSchema.index({ isDeleted: 1, createdAt: -1 });
postSchema.index({ replyTo: 1, createdAt: -1 });

// Pre-save middleware to extract hashtags and mentions
postSchema.pre("save", function () {
  if (this.isModified("content")) {
    // Extract hashtags
    const hashtagRegex = /#(\w+)/g;
    const hashtags = this.content.match(hashtagRegex);
    this.hashtags = hashtags
      ? hashtags.map((tag) => tag.slice(1).toLowerCase())
      : [];
  }
});

// Virtual for upvote count
postSchema.virtual("upvoteCount").get(function () {
  return this.upvotes?.length || 0;
});

// Virtual for downvote count
postSchema.virtual("downvoteCount").get(function () {
  return this.downvotes?.length || 0;
});

// Virtual for reply count
postSchema.virtual("replyCount").get(function () {
  return this.replies?.length || 0;
});

// Virtual for score (upvotes - downvotes)
postSchema.virtual("score").get(function () {
  return (this.upvotes?.length || 0) - (this.downvotes?.length || 0);
});

// Static method to find posts by author
postSchema.statics.findByAuthor = function (authorId: mongoose.Types.ObjectId) {
  return this.find({ author: authorId, isDeleted: false, replyTo: null })
    .sort({ createdAt: -1 })
    .populate("author", "firstname lastname username avatar isVerified");
};

// Static method to get feed for user
postSchema.statics.findFeedForUser = async function (
  userId: mongoose.Types.ObjectId,
  page: number = 1,
  limit: number = 20
) {
  const User = mongoose.model("User");
  const user = await User.findById(userId).select("following");
  
  if (!user) return [];

  const followingIds = [...user.following, userId]; // Include user's own posts

  return this.find({
    author: { $in: followingIds },
    isDeleted: false,
    replyTo: null, // Don't show replies in main feed
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("author", "firstname lastname username avatar isVerified");
};

// Ensure virtuals are included in JSON output
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

const Post = mongoose.model<IPost, IPostModel>("Post", postSchema);

export default Post;
