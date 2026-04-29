import { getAuthToken, removeAuthToken, setAuthToken } from "@/lib/cookies";
import { Permission, Role, User, getId } from "@/types/auth";
import { create } from "zustand";

export interface AuthState {
  // auth state
  user: User | null;
  token: string | null;
  roles: Role[];
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  lastPermissionUpdate: number;

  // auth actions
  initializeAuth: () => void;
  setToken: (token: string) => void;
  setUserProfile: (user: User, roles: Role[], permissions: Permission[]) => void;
  clearAuth: () => void;

  // realtime actions
  updateRoleInList: (role: Role) => void;
  setPermissions: (permissions: Permission[]) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  roles: [],
  permissions: [],
  isAuthenticated: false,
  isLoading: true,
  lastPermissionUpdate: 0,

  // Read token from cookie on app start.
  // Keep isLoading: true so socket waits until user profile is fetched.
  initializeAuth: () => {
    const token = getAuthToken();
    if (token) {
      set({ token, isAuthenticated: true });
    } else {
      set({ isLoading: false });
    }
  },

  setToken: (token) => {
    setAuthToken(token);
    set({ token, isAuthenticated: true });
  },

  // Called after getMe() API resolves. Sets user + marks loading done.
  // Also called when snapshot/user.permissions arrives to refresh roles+permissions.
  setUserProfile: (user, roles, permissions) => {
    set({ user, roles, permissions, isAuthenticated: true, isLoading: false, lastPermissionUpdate: Date.now() });
  },

  clearAuth: () => {
    removeAuthToken();
    set({
      token: null,
      user: null,
      roles: [],
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
    });
  },

  // When a role.updated socket event arrives, replace that role in the list.
  updateRoleInList: (updatedRole) => {
    set((prev) => ({
      roles: prev.roles.map((r) => getId(r) === getId(updatedRole) ? updatedRole : r),
    }));
  },

  // When permissions are recalculated, update them and bump the timestamp
  // so usePermission hook re-runs its useMemo.
  setPermissions: (permissions) => {
    set({ permissions, lastPermissionUpdate: Date.now() });
  },
}));
