"use server";

import apiClient from "@/apiClient/apiClient";

export interface Notification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    firstname: string;
    lastname?: string;
    username: string;
    avatar?: string;
  };
  type: "like" | "comment" | "follow";
  post?: {
    _id: string;
    content: string;
    media: any[];
  };
  isRead: boolean;
  createdAt: string;
}

export const getNotifications = async (page: number = 1, limit: number = 20) => {
  try {
    const res = await apiClient.get<{ notifications: Notification[]; unreadCount: number; hasMore: boolean }>(
      `/api/notifications`,
      {
         params: { page, limit },
         cache: "no-store",
      }
    );
    return { success: true, ...res.data };
  } catch (error: any) {
    console.error("Get notifications error:", error);
    return { success: false, error: error.message || "Failed to fetch notifications" };
  }
};

export const markAsRead = async (notificationId: string = "all") => {
  try {
    const res = await apiClient.put<{ message: string; success: boolean }>(`/api/notifications/${notificationId}/read`, {});
    return { success: true, message: res.data.message };
  } catch (error: any) {
    console.error("Mark read error:", error);
    return { success: false, error: error.message || "Failed to mark as read" };
  }
};
