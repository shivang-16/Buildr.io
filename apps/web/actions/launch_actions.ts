"use server";

import apiClient from "@/apiClient/apiClient";

export interface Launch {
  _id: string;
  name: string;
  url?: string;
  tagline: string;
  image?: string;
  gallery?: string[];
  categories: string[];
  builtWith: string[];
  collaborators: string[];
  isOpenSource: boolean;
  description?: string;
  launchDate: string;
  author: {
    _id: string;
    firstname: string;
    lastname?: string;
    username: string;
    avatar?: string;
  };
  upvotes: string[];
  upvoteCount: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface LaunchResponse {
  success: boolean;
  launch?: Launch;
  launches?: Launch[];
  message?: string;
  canLaunch?: boolean;
  hasUpvoted?: boolean;
  date?: string;
}

export interface CreateLaunchData {
  name: string;
  url?: string;
  tagline: string;
  categories?: string[];
  builtWith?: string[];
  collaborators?: string[];
  isOpenSource?: boolean;
  description?: string;
}

// Create a launch
export async function createLaunch(data: CreateLaunchData): Promise<LaunchResponse> {
  try {
    const response = await apiClient.post<LaunchResponse>("/api/launches", data);
    return response.data;
  } catch (error: any) {
    console.error("Failed to create launch:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create launch",
    };
  }
}

// Get launches by date
export async function getLaunches(date?: string): Promise<LaunchResponse> {
  try {
    const response = await apiClient.get<LaunchResponse>("/api/launches", {
      params: date ? { date } : undefined,
      cache: "no-store",
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to get launches:", error);
    return {
      success: false,
      launches: [],
      message: error.response?.data?.message || "Failed to get launches",
    };
  }
}

// Toggle upvote
export async function toggleUpvote(launchId: string): Promise<LaunchResponse> {
  try {
    const response = await apiClient.post<LaunchResponse>(
      `/api/launches/${launchId}/upvote`
    );
    return response.data;
  } catch (error: any) {
    console.error("Failed to toggle upvote:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to toggle upvote",
    };
  }
}

// Check if user can launch
export async function checkCanLaunch(): Promise<LaunchResponse> {
  try {
    const response = await apiClient.get<LaunchResponse>("/api/launches/can-launch");
    return response.data;
  } catch (error: any) {
    console.error("Failed to check launch status:", error);
    return {
      success: false,
      canLaunch: false,
      message: error.response?.data?.message || "Failed to check launch status",
    };
  }
}
