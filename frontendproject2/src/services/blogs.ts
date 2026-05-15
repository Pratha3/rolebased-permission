import { apiClient } from "./client";

export type BlogPost = {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  status: "draft" | "published" | "archived";
  authorId: string;
  authorName: string;
  views: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BlogPayload = {
  title: string;
  excerpt?: string;
  content?: string;
};

export const getBlogs = () => apiClient.get<BlogPost[]>("/blogs");

export const createBlog = (payload: BlogPayload) =>
  apiClient.post<BlogPost>("/blogs", payload);

export const updateBlog = (blogId: string, payload: BlogPayload) =>
  apiClient.patch<BlogPost>(`/blogs/${blogId}`, payload);

export const publishBlog = (blogId: string) =>
  apiClient.post<BlogPost>(`/blogs/${blogId}/publish`);

export const archiveBlog = (blogId: string) =>
  apiClient.post<BlogPost>(`/blogs/${blogId}/archive`);
