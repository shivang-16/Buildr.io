import mongoose, { Document, Schema } from "mongoose";

// Interface for temporary user data during registration
interface INewUser {
  firstname: string;
  lastname: string | null;
  email: string;
  password: string;
}

// Interface for OTP document
export interface IOTP extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  newUser: INewUser;
  createdAt: Date;
}

const newUserSchema = new Schema<INewUser>(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const otpSchema = new Schema<IOTP>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: [true, "OTP is required"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry time is required"],
      index: { expires: 0 }, // TTL index - auto-delete when expired
    },
    newUser: {
      type: newUserSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookup by email
otpSchema.index({ email: 1 });

const OTPModel = mongoose.model<IOTP>("OTP", otpSchema);

export default OTPModel;
