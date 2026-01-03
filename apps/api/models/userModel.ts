import mongoose, { Document, Schema, Model } from "mongoose";
import crypto from "crypto";
import jwt from "jsonwebtoken";

// Interface for User document
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstname: string;
  lastname: string | null;
  email: string;
  password?: string;
  salt: string;
  username: string;
  avatar: string | null;
  coverImage: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  dateOfBirth: Date | null;
  isVerified: boolean;
  isPrivate: boolean;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  bookmarks: mongoose.Types.ObjectId[];
  resetPasswordToken: string | null;
  resetTokenExpiry: Date | null;
  googleId: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(password: string): Promise<boolean>;
  getToken(): Promise<string>;
  generateAuthToken(): string;
}

// Interface for User model (static methods)
export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

const userSchema = new Schema<IUser>(
  {
    firstname: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastname: {
      type: String,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
      default: null,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    salt: {
      type: String,
      select: false,
    },
    username: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    avatar: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [160, "Bio cannot exceed 160 characters"],
      default: null,
    },
    location: {
      type: String,
      maxlength: [100, "Location cannot exceed 100 characters"],
      default: null,
    },
    website: {
      type: String,
      maxlength: [100, "Website URL cannot exceed 100 characters"],
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    followers: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
    following: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
    bookmarks: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Post",
        },
      ],
      default: [],
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);


// Pre-save middleware for password hashing
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  // Generate salt and hash password
  const salt = crypto.randomBytes(16).toString("hex");
  
  return new Promise<void>((resolve, reject) => {
    crypto.pbkdf2(this.password!, salt, 1000, 64, "sha512", (err, derivedKey) => {
      if (err) return reject(err);
      this.password = derivedKey.toString("hex");
      this.salt = salt;
      resolve();
    });
  });
});

// Generate username from email if not provided
userSchema.pre("save", function () {
  if (!this.username) {
    const emailPart = this.email.split("@")[0];
    const randomSuffix = Math.floor(Math.random() * 10000);
    this.username = `${emailPart}_${randomSuffix}`;
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, this.salt, 1000, 64, "sha512", (err, derivedKey) => {
      if (err) return reject(err);
      resolve(this.password === derivedKey.toString("hex"));
    });
  });
};

// Generate reset password token
userSchema.methods.getToken = async function (): Promise<string> {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // Token valid for 15 minutes

  return resetToken;
};

// Generate JWT auth token
userSchema.methods.generateAuthToken = function (): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");

  return jwt.sign({ id: this._id }, secret, {
    expiresIn: "7d",
  } as jwt.SignOptions);
};

// Static method to find user by email
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return this.lastname
    ? `${this.firstname} ${this.lastname}`
    : this.firstname;
});

// Ensure virtuals are included in JSON output
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

const User = mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;
