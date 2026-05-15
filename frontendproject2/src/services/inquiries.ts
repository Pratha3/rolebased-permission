import { User } from "@/types/auth";
import { apiClient } from "./client";

export type Inquiry = {
  _id: string;
  subject: string;
  message: string;
  customerName: string;
  customerEmail: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in-progress" | "closed";
  assignedToId?: string | null;
  assignedToName?: string;
  response?: string;
  respondedById?: string | null;
  respondedByName?: string;
  respondedAt?: string | null;
  closedById?: string | null;
  closedByName?: string;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const getInquiries = () => apiClient.get<Inquiry[]>("/inquiries");

export const assignInquiry = (inquiryId: string, userId: string) =>
  apiClient.post<Inquiry>(`/inquiries/${inquiryId}/assign`, { userId });

export const respondToInquiry = (inquiryId: string, response: string) =>
  apiClient.post<Inquiry>(`/inquiries/${inquiryId}/respond`, { response });

export const closeInquiry = (inquiryId: string) =>
  apiClient.post<Inquiry>(`/inquiries/${inquiryId}/close`);

export const getAssignableUsers = () => apiClient.get<User[]>("/users");
