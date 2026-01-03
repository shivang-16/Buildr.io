"use server";

import apiClient from "@/apiClient/apiClient";

export interface User {
  _id: string;
  firstname: string;
  lastname?: string;
  username?: string;
  email: string;
  avatar?: string;
  bio?: string;
  isVerified?: boolean;
  following?: string[];
  followers?: string[];
  createdAt: string;
}

export interface UserResponse {
  success: boolean;
  user?: User;
  message?: string;
}

// Get current logged in user
export async function getCurrentUser(): Promise<UserResponse> {
  try {
    const res = await apiClient.get<UserResponse>("/api/auth/user");
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to get current user:", error);
    return { success: false, message: "Not authenticated" };
  }
}

// Get user by username
export async function getUserByUsername(username: string): Promise<UserResponse> {
  try {
    const res = await apiClient.get<UserResponse>(`/api/users/${username}`);
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to get user:", error);
    return { success: false, message: "User not found" };
  }
}

// Follow/unfollow a user
export async function followUser(userId: string) {
  try {
    const res = await apiClient.post(`/api/users/${userId}/follow`);
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to follow user:", error);
    return { success: false, message: "Failed to follow user" };
  }
}

// Sign up a new user
export async function signUpUser(data: { name: string; email: string; password: string }) {
  try {
    const response = await fetch('/api/auth/register', {
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
    const response = await fetch('/api/auth/resend', {
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
    const response = await fetch('/api/auth/verify', {
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
    const response = await fetch('/api/auth/logout', {
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
