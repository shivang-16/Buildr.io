"use server";

import apiClient from "@/apiClient/apiClient";
import { Post } from "./post_actions";

export interface User {
  _id: string;
  firstname: string;
  lastname?: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  isVerified?: boolean;
  following?: string[];
  followers?: string[];
  bookmarks?: string[];
  createdAt: string;
  isFollowing?: boolean; 
}

export interface UserResponse {
  success: boolean;
  user?: User;
  users?: User[];
  message?: string;
  isFollowing?: boolean;
  page?: number;
  hasMore?: boolean;
}

export interface BookmarkResponse {
  success: boolean;
  message: string;
  isBookmarked: boolean;
}

export interface PostsResponse {
  success: boolean;
  posts: Post[];
  page: number;
  hasMore: boolean;
}

// Get current logged in user
export async function getCurrentUser(): Promise<UserResponse> {
  try {
    const res = await apiClient.get<UserResponse>("/api/auth/user", { cache: "no-store" });
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to get current user:", error);
    return { success: false, message: "Not authenticated" };
  }
}

// Get user profile (public)
export async function getUserProfile(username: string): Promise<UserResponse> {
  try {
    const res = await apiClient.get<UserResponse>(`/api/users/profile/${username}`, { cache: "no-store" });
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to get user profile:", error);
    return { success: false, message: "User not found" };
  }
}

// Get all users (Explore)
export async function getAllUsers(page: number = 1, limit: number = 20) {
  try {
    const res = await apiClient.get<UserResponse>("/api/users", {
      params: { page, limit },
      cache: "no-store",
    });
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to get users:", error);
    return { success: false, users: [], page: 1, hasMore: false };
  }
}

// Follow/unfollow a user
export async function toggleFollow(userId: string) {
  try {
    const res = await apiClient.post<UserResponse>(`/api/users/${userId}/follow`);
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to toggle follow:", error);
    return { success: false, message: "Failed to update follow status" };
  }
}

// Toggle bookmark
export async function toggleBookmark(postId: string) {
  try {
    const res = await apiClient.post<BookmarkResponse>(`/api/users/bookmark/${postId}`);
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to toggle bookmark:", error);
    return { success: false, message: "Failed to update bookmark", isBookmarked: false };
  }
}

// Get bookmarked posts
export async function getBookmarks(page: number = 1, limit: number = 20) {
  try {
    const res = await apiClient.get<PostsResponse>("/api/users/bookmarks", {
      params: { page, limit },
    });
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to get bookmarks:", error);
    return { success: false, posts: [], page: 1, hasMore: false };
  }
}

// Get user posts or replies
export async function getUserPosts(userId: string, type: "posts" | "replies" = "posts", page: number = 1, limit: number = 20) {
  try {
    const res = await apiClient.get<PostsResponse>(`/api/users/${userId}/posts`, {
      params: { type, page, limit },
    });
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to get user posts:", error);
    return { success: false, posts: [], page: 1, hasMore: false };
  }
}

// Get followers
export async function getFollowers(userId: string) {
  try {
    const res = await apiClient.get<UserResponse>(`/api/users/${userId}/followers`, { cache: "no-store" });
    return res.data.users || [];
  } catch (error: unknown) {
    console.error("Failed to get followers:", error);
    return [];
  }
}

// Get following
export async function getFollowing(userId: string) {
  try {
    const res = await apiClient.get<UserResponse>(`/api/users/${userId}/following`, { cache: "no-store" });
    return res.data.users || [];
  } catch (error: unknown) {
    console.error("Failed to get following:", error);
    return [];
  }
}

// Update User Profile
export async function updateCurrentUser(data: Partial<User>) {
  try {
    const res = await apiClient.put<UserResponse>("/api/users/profile", data);
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to update profile:", error);
    return { success: false, message: "Failed to update profile" };
  }
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Sign up a new user
export async function signUpUser(data: { name: string; email: string; password: string }) {
  try {
    const response = await fetch(`${appUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (response.ok) {
      return { success: true, ...responseData };
    } else {
      return { success: false, message: responseData.message };
    }
  } catch (error: unknown) {
    console.error('Failed to sign up user:', error);
    return { success: false, message: 'Failed to sign up user' };
  }
}

// Resend OTP for email verification
export async function resendOtp(email: string) {
  try {
    const response = await fetch(`${appUrl}/api/auth/resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, ...data };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error: unknown) {
    console.error('Failed to resend OTP:', error);
    return { success: false, message: 'Failed to resend OTP' };
  }
}

// Verify OTP
export async function verifyOtp(data: { email: string; otp: string }) {
  try {
    const response = await fetch(`${appUrl}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (response.ok) {
      return { success: true, ...responseData };
    } else {
      return { success: false, message: responseData.message };
    }
  } catch (error: unknown) {
    console.error('Failed to verify OTP:', error);
    return { success: false, message: 'Failed to verify OTP' };
  }
}

// Logout user
export async function logoutUser() {
  try {
    const response = await fetch(`${appUrl}/api/auth/logout`, {
      method: 'POST',
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, ...data };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error: unknown) {
    console.error('Failed to logout:', error);
    return { success: false, message: 'Failed to logout' };
  }
}

// Login user
export async function loginUser(data: { email: string; password: string }) {
  try {
    const response = await fetch(`${appUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (response.ok) {
      return { success: true, ...responseData };
    } else {
      return { success: false, message: responseData.message };
    }
  } catch (error: unknown) {
    console.error('Failed to login:', error);
    return { success: false, message: 'Failed to login' };
  }
}
