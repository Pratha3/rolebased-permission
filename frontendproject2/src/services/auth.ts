import { LoginResponse, Profile } from "@/types/auth";
import { apiClient } from "./client";

export const login = (email: string, password: string) =>
  apiClient.post<LoginResponse>("/auth/login", { email, password });

export const getMe = () => apiClient.get<Profile>("/me");
export const getProfiles = () => apiClient.get<Profile[]>("/profiles");

export const getProfile = (userId: string) =>
  apiClient.get<Profile>(`/profiles/${userId}`);
