import { Request, Response, NextFunction } from "express";
import User from "../../models/userModel";
import { CustomError } from "../../middlewares/error";
import setCookie from "../../utils/setCookie";
import generateOTP from "../../utils/generateOTP";
import crypto from "crypto";
import OTPModel from "../../models/otpModal";
import { sendMail } from "../../utils/sendMail";
import jwt, { JwtPayload } from "jsonwebtoken";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("register: Starting user registration");
    
    const { name, email, password } = req.body;
    console.log("register: Registration request", { name, email });

    const user = await User.findOne({ email });
    if (user) {
      console.log("register: User already exists", { email });
      return next(new CustomError("User already exists", 400));
    }

    const OTP = generateOTP();
    console.log("register: OTP generated", { email, otpLength: OTP.length });

    // await otpQueue.add("otpVerify", {
    //   options: {
    //     email,
    //     subject: "Verification",
    //     message: `Your verification OTP for registration is ${OTP}`,
    //   },
    // });

    await sendMail({
      email,
      subject: "Verification",
      message: OTP,
      tag: "otp",
    });
    console.log("register: OTP email sent", { email });

    const nameArray = name.split(" ");
    const newUser = {
      firstname: nameArray[0],
      lastname: nameArray.length > 1 ? nameArray.slice(1).join(" ") : null,
      email,
      password,
    };
    console.log("register: User data prepared", { 
      firstname: newUser.firstname, 
      lastname: newUser.lastname, 
      email 
    });

    // Save OTP and newUser data in the OTP model
    const hashedOTP = crypto.createHash("sha256").update(OTP).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const existingOtpRecord = await OTPModel.findOne({ email });
    if (existingOtpRecord) {
      existingOtpRecord.otp = hashedOTP;
      existingOtpRecord.expiresAt = expiresAt;
      existingOtpRecord.newUser = newUser;
      await existingOtpRecord.save();
      console.log("register: Updated existing OTP record", { email });
    } else {
      const otpRecord = new OTPModel({
        email,
        otp: hashedOTP,
        expiresAt,
        newUser,
      });
      await otpRecord.save();
      console.log("register: Created new OTP record", { email });
    }

    console.log("register: Registration process completed", { email });

    res
      .status(200)
      .cookie("email", email, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .json({
        success: true,
        message: `Verification OTP sent to ${email}`,
      });
  } catch (error: any) {
    console.log("register: Error occurred", { 
      error: error.message, 
      stack: error.stack 
    });
    next(new CustomError(error.message));
  }
};

export const resentOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("resentOtp: Starting OTP resend process");
    
    const { email } = req.body;
    console.log("resentOtp: Resend request", { email });

    const otpRecord = await OTPModel.findOne({ email });
    if (!otpRecord) {
      console.log("resentOtp: User not found", { email });
      return next(new CustomError("User not found", 404));
    }

    const OTP = generateOTP();
    console.log("resentOtp: New OTP generated", { email, otpLength: OTP.length });

    // await otpQueue.add("otpVerify", {
    //   options: {
    //     email,
    //     subject: "Verification",
    //     message: `Your verification OTP for registration is ${OTP}`,
    //   },
    // });

    await sendMail({
      email,
      subject: "Verification",
      message: OTP,
      tag: "otp",
    });
    console.log("resentOtp: OTP email sent", { email });

    otpRecord.otp = crypto.createHash("sha256").update(OTP).digest("hex");
    otpRecord.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    await otpRecord.save();
    console.log("resentOtp: OTP record updated", { email });

    console.log("resentOtp: OTP resend completed", { email });

    res.status(200).json({
      success: true,
      message: `OTP resent successfully to ${email}`,
    });
  } catch (error: any) {
    console.log("resentOtp: Error occurred", { 
      error: error.message, 
      stack: error.stack 
    });
    next(new CustomError(error.message));
  }
};

export const otpVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("otpVerification: Starting OTP verification");
    
    const { otp, email } = req.body;
    console.log("otpVerification: Verification request", { email, otpLength: otp?.length });

    const otpRecord = await OTPModel.findOne({ email });
    if (!otpRecord) {
      console.log("otpVerification: OTP record not found", { email });
      return next(new CustomError("OTP not found", 404));
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    const isExpired = otpRecord.expiresAt < new Date(Date.now());
    const isValid = hashedOtp === otpRecord.otp;
    
    console.log("otpVerification: OTP validation", { 
      email, 
      isValid, 
      isExpired,
      expiresAt: otpRecord.expiresAt,
      currentTime: new Date(Date.now())
    });

    if (!isValid || isExpired) {
      console.log("otpVerification: Invalid or expired OTP", { email, isValid, isExpired });
      return next(new CustomError("Invalid or expired OTP", 400));
    }

    const newUser = otpRecord.newUser;
    
    // Create a plain object to avoid Mongoose subdocument issues (VersionError)
    const userData = {
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      email: newUser.email,
      password: newUser.password
    };

    console.log("otpVerification: Creating user", { 
      email, 
      firstname: userData.firstname,
      lastname: userData.lastname 
    });
    
    const user = await User.create(userData);
    await OTPModel.deleteOne({ email });
    console.log("otpVerification: User created and OTP record deleted", { email, userId: user._id });

    setCookie({
      user,
      res,
      next,
      message: "Verification Success",
      statusCode: 200,
    });
  } catch (error: any) {
    console.log("otpVerification: Error occurred", { 
      error: error.message, 
      stack: error.stack 
    });
    next(new CustomError(error.message));
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("login: Starting user login");
    
    const { email, password } = req.body;
    console.log("login: Login request", { email });

    const user = await User.findOne({ email }).select("+password +salt");
    if (!user) {
      console.log("login: Email not registered", { email });
      return next(new CustomError("Email not registered", 404));
    }

    console.log("login: User found", { email, userId: user._id });

    // Use the comparePassword method here
    const isMatched = await user.comparePassword(password);
    console.log("login: Password verification", { email, isMatched });
    
    if (!isMatched) {
      console.log("login: Wrong password", { email });
      return next(new CustomError("Wrong password", 400));
    }

    console.log("login: Login successful", { email, userId: user._id });

    setCookie({
      user,
      res,
      next,
      message: "Login Success",
      statusCode: 200,
    });
  } catch (error: any) {
    console.log("login: Error occurred", { 
      error: error.message, 
      stack: error.stack 
    });
    next(new CustomError(error.message));
  }
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.body;
    if (!token)
      return next(
        new CustomError("Invalid token received or has expired!", 400)
      );

    const secret = process.env.JWT_SECRET;
    if (!secret) return next(new CustomError("Jwt Secret not defined", 400));

    const decoded = jwt.verify(token, secret) as JwtPayload;
    const user = await User.findById(decoded.id);
    if (!user)
      return next(new CustomError("Invalid token or has expired!", 400));

    return res.status(200).json({
      success: true,
      isValidToken: true,
      message: "Token verified successfully!",
    });
  } catch (error: any) {
    console.log(error);
    next(new CustomError(error.message));
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new CustomError("Email not registered", 400));

    const resetToken = await user.getToken();

    await user.save(); //saving the token in user

    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
    // await otpQueue.add("otpVerify", {
    //   options: {
    //     email: email,
    //     subject: "Password Reset",
    //     message: `You reset password link is here ${url}`,
    //   },
    // });

    await sendMail({
      email,
      subject: "Password Reset",
      message: url,
      tag: "password_reset",
    });

    res.status(200).json({
      success: true,
      message: `Reset password link sent to ${email}`,
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

export const resetpassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const resetToken = req.params.token;
    if (!resetToken) return next(new CustomError("Something went wrong", 400));

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetTokenExpiry: {
        $gt: Date.now(),
      },
    });

    if (!user)
      return next(new CustomError("Your link is expired! Try again", 400));

    const salt = crypto.randomBytes(16).toString("hex");
    crypto.pbkdf2(
      req.body.password,
      salt,
      1000,
      64,
      "sha512",
      async (err, derivedKey) => {
        if (err) return next(new CustomError(err.message, 500));

        user.password = derivedKey.toString("hex");
        user.salt = salt;
        user.resetPasswordToken = null;
        user.resetTokenExpiry = null;

        await user.save();

        res.status(200).json({
          success: true,
          message: "You password has been changed",
        });
      }
    );
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

export const logout = async (req: Request, res: Response) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      sameSite: "none",
      secure: true,
    })
    .json({
      success: true,
      message: "Logged out",
    });
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return next(new CustomError("User not found", 400));

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};
