"use server";

import apiClient from "@/apiClient/apiClient";

// Media interface matching backend
interface Media {
  type: "image";
  url: string;
  publicId: string;
  altText?: string;
  width?: number;
  height?: number;
}

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
  media: Media[];
  upvotes: string[];
  downvotes: string[];
  replies: string[];
  replyTo: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  upvoteCount?: number;
  downvoteCount?: number;
  replyCount?: number;
  score?: number;
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
  comments?: Post[];
  message?: string;
}

export interface VoteResponse {
  success: boolean;
  message: string;
  upvoted?: boolean;
  downvoted?: boolean;
  upvoteCount: number;
  downvoteCount: number;
  score: number;
}

export interface CommentsResponse {
  success: boolean;
  comments: Post[];
  page: number;
  hasMore: boolean;
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

// Get single post with comments
export async function getPost(postId: string) {
  try {
    const res = await apiClient.get<PostResponse>(`/api/posts/${postId}`);
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to fetch post:", error);
    return null;
  }
}

// Get comments for a post
export async function getComments(postId: string, page: number = 1, limit: number = 20) {
  try {
    const res = await apiClient.get<CommentsResponse>(`/api/posts/${postId}/comments`, {
      params: { page, limit },
    });
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to fetch comments:", error);
    return { success: false, comments: [], page: 1, hasMore: false };
  }
}

// Create a new post (text only - for simple posts without images)
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

// Create a new post with images (FormData)
export async function createPostWithImages(formData: FormData) {
  try {
    const res = await apiClient.post<PostResponse>("/api/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to create post:", error);
    return { success: false, message: "Failed to create post" };
  }
}

// Upvote a post
export async function upvotePost(postId: string) {
  try {
    const res = await apiClient.post<VoteResponse>(`/api/posts/${postId}/upvote`);
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to upvote post:", error);
    return { success: false, upvoteCount: 0, downvoteCount: 0, score: 0, message: "Failed to upvote post" };
  }
}

// Downvote a post
export async function downvotePost(postId: string) {
  try {
    const res = await apiClient.post<VoteResponse>(`/api/posts/${postId}/downvote`);
    return res.data;
  } catch (error: unknown) {
    console.error("Failed to downvote post:", error);
    return { success: false, upvoteCount: 0, downvoteCount: 0, score: 0, message: "Failed to downvote post" };
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
