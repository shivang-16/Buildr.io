import { Schema, model, Document, Model } from "mongoose";

export interface ILaunch extends Document {
  name: string;
  url?: string;
  tagline: string;
  image?: string;
  gallery?: string[];
  categories: string[];
  builtWith: string[];
  collaborators: Schema.Types.ObjectId[];
  isOpenSource: boolean;
  description?: string;
  launchDate: Date;
  author: Schema.Types.ObjectId;
  upvotes: Schema.Types.ObjectId[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILaunchModel extends Model<ILaunch> {
  getLaunchesByDate(date: Date): Promise<ILaunch[]>;
  checkUserLaunchedToday(userId: string): Promise<boolean>;
}

const launchSchema = new Schema<ILaunch, ILaunchModel>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 45,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
    tagline: {
      type: String,
      required: true,
      maxlength: 60,
      trim: true,
    },
    image: {
      type: String,
    },
    gallery: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.length <= 5,
        message: "Maximum 5 gallery images allowed",
      },
    },
    categories: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.length <= 3,
        message: "Maximum 3 categories allowed",
      },
    },
    builtWith: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.length <= 10,
        message: "Maximum 10 tech tags allowed",
      },
    },
    collaborators: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isOpenSource: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      maxlength: 5000,
    },
    launchDate: {
      type: Date,
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Virtual for upvote count
launchSchema.virtual("upvoteCount").get(function () {
  return this.upvotes?.length || 0;
});

// Ensure virtuals are included in JSON
launchSchema.set("toJSON", { virtuals: true });
launchSchema.set("toObject", { virtuals: true });

// Static method to get launches by date
launchSchema.statics.getLaunchesByDate = async function (date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    launchDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  })
    .populate("author", "firstname lastname username avatar")
    .sort({ upvotes: -1 })
    .exec();
};

// Static method to check if user launched today
launchSchema.statics.checkUserLaunchedToday = async function (userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const launch = await this.findOne({
    author: userId as any,
    launchDate: {
      $gte: today,
      $lt: tomorrow,
    },
  });

  return !!launch;
};

// Index for efficient queries
launchSchema.index({ launchDate: 1, upvotes: -1 });
launchSchema.index({ author: 1, launchDate: 1 });

const Launch = model<ILaunch, ILaunchModel>("Launch", launchSchema);

export default Launch;
