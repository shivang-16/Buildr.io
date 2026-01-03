"use server";

import apiClient from "@/apiClient/apiClient";

export interface Post {
  _id: string;
  author: {
    _id: string;
    firstname: string;
    lastname?: string;
    username?: string;
    avatar?: string;
    isVerified?: boolean;
  };
  content: string;
  likes: string[];
  reposts: string[];
  replies: string[];
  replyTo: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  likeCount?: number;
  replyCount?: number;
  repostCount?: number;
}

export interface FeedResponse {
  success: boolean;
  posts: Post[];
  page: number;
  hasMore: boolean;
}

export interface PostResponse {
  success: boolean;
  post: Post;
  replies?: Post[];
  message?: string;
}

export interface LikeResponse {
  success: boolean;
  message: string;
  liked: boolean;
  likeCount: number;
}

// Get feed posts
export async function getFeedPosts(page: number = 1, limit: number = 20) {
  try {
    const res = await apiClient.get<FeedResponse>(`/api/posts`, {
      params: { page, limit },
    });
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to fetch feed posts:", error);
    return { success: false, posts: [], page: 1, hasMore: false };
  }
}

// Get single post with replies
export async function getPost(postId: string) {
  try {
    const res = await apiClient.get<PostResponse>(`/api/posts/${postId}`);
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to fetch post:", error);
    return null;
  }
}

// Create a new post (or reply)
export async function createPost(content: string, replyTo?: string) {
  try {
    const res = await apiClient.post<PostResponse>("/api/posts", {
      content,
      replyTo,
    });
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to create post:", error);
    return { success: false, message: "Failed to create post" };
  }
}

// Like/unlike a post
export async function likePost(postId: string) {
  try {
    const res = await apiClient.post<LikeResponse>(`/api/posts/${postId}/like`);
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to like post:", error);
    return { success: false, liked: false, likeCount: 0, message: "Failed to like post" };
  }
}

// Delete a post
export async function deletePost(postId: string) {
  try {
    const res = await apiClient.delete(`/api/posts/${postId}`);
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to delete post:", error);
    return { success: false, message: "Failed to delete post" };
  }
}
