import { Permission, Profile, Resource, Role, User } from "@/types/auth";
import { apiClient } from "./client";

export type RolePayload = {
  name: string;
  description?: string;
  permissions: Permission[];
};

export type UserPayload = {
  name: string;
  email: string;
  password?: string;
  roleIds?: string[];
};

export const getResources = () => apiClient.get<Resource[]>("/resources");

export const getRoles = () => apiClient.get<Role[]>("/roles");

export const createRole = (payload: RolePayload) =>
  apiClient.post<Role>("/roles", payload);

export const updateRole = (roleId: string, payload: Partial<RolePayload>) =>
  apiClient.patch<Role>(`/roles/${roleId}`, payload);

export const deleteRole = (roleId: string) =>
  apiClient.delete<void>(`/roles/${roleId}`);

export const getUsers = () => apiClient.get<User[]>("/users");

export const createUser = (payload: UserPayload & { password: string }) =>
  apiClient.post<User>("/users", payload);

export const updateUser = (userId: string, payload: Partial<UserPayload>) =>
  apiClient.patch<User>(`/users/${userId}`, payload);

export const getUserPermissions = (userId: string) =>
  apiClient.get<Profile>(`/users/${userId}/permissions`);

export const changePassword = (
  currentPassword: string,
  newPassword: string,
) => apiClient.post<{ status: string }>("/me/password", { currentPassword, newPassword });
