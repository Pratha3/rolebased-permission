export interface User {
  _id: string;
  name: string;
  email: string;
  roleIds: string[];
  createdAt: string;
  avatarUrl:string;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  _id: string;
  name: string;
  actions: string[];
}

export interface Profile {
  user: User;
  roles: Role[];
  permissions: Permission[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
