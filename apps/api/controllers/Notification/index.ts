import { Request, Response, NextFunction } from "express";
import Notification from "../../models/notificationModel";
import { CustomError } from "../../middlewares/error";

// Helper function to create notification (internal use)
export const createNotification = async (
  recipientId: string,
  senderId: string,
  type: "like" | "comment" | "follow",
  postId?: string
) => {
  try {
    if (recipientId.toString() === senderId.toString()) return;

    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      post: postId,
    });
    
    // In future, emit socket event here
    return notification;
  } catch (error) {
    console.error("Failed to create notification", error);
  }
};

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("sender", "firstname lastname username avatar")
      .populate("post", "content media"); // Optional: populate post preview

    // Mark these as read? Or separate endpoint? 
    // Usually fetching doesn't mark read automatically unless specified, 
    // but for simplicity we can just fetch.

    // Check if there are unread
    const unreadCount = await Notification.countDocuments({ 
        recipient: userId, 
        isRead: false 
    });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      page,
      hasMore: notifications.length === limit,
    });
  } catch (error: unknown) {
    next(new CustomError(error instanceof Error ? error.message : "An error occurred"));
  }
};

export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    if (notificationId === "all") {
        await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );
    } else {
        await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    }

    res.status(200).json({
      success: true,
      message: "Marked as read",
    });
  } catch (error: unknown) {
    next(new CustomError(error instanceof Error ? error.message : "An error occurred"));
  }
};
