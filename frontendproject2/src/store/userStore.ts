import { getAuthToken, removeAuthToken, setAuthToken } from "@/lib/cookies";
import { Permission, Role, User } from "@/types/auth";
import { create } from "zustand";

export interface AuthState {
  user: User | null;
  token: string | null;
  roles: Role[];
  permissions: Permission[];
  resources: Resource[];
  users: User[];
  isAuthenticated: boolean;
  isLoading: boolean;

  // actions
  setToken: (token: string) => void;
  setUserProfile: (user: User, roles: Role[], permission: Permission[]) => void;
  clearAuth: () => void;
  updatePermissions: (permission: Permission[]) => void;
  intializeAuth: () => void;
  setLoading: (loading: boolean) => void;

  // realtime-related actions
  setSnapshot: (snapshot: {
    resources?: Resource[];
    roles?: Role[];
    users?: User[];
    viewer?: { user?: User; roles?: Role[]; permissions?: Permission[] };
  }) => void;
  updateRole: (
    op: "create" | "update" | "delete",
    payload: Role | { id: string },
  ) => void;
  updateUser: (op: "create" | "update", payload: User) => void;
  setUserPermissions: (profile: Profile) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  roles: [],
  permissions: [],
  resources: [],
  users: [],
  isAuthenticated: false,
  isLoading: true,

  intializeAuth: () => {
    const token = getAuthToken();
    if (token) {
      set({
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({
        isLoading: false,
      });
    }
  },

  setToken: (token) => {
    setAuthToken(token);
    set({
      token,
      isAuthenticated: true,
    });
  },

  setUserProfile: (user, roles, apiPermissions) => {
    set({
      user,
      roles,
      permissions: apiPermissions,
      isLoading: false,
      isAuthenticated: true,
    });
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

  updatePermissions: (apiPermissions) => {
    set({
      permissions: apiPermissions,
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  //   1. Keeps existing state by default.
  //   2. Replaces resources, roles, users only if the snapshot provided them.
  //   3. If the snapshot includes "viewer" (data for the current user), update
  //      the current user's profile, roles, and permissions so the UI reflects
  //      the viewer's effective permissions immediately.
  setSnapshot: (snapshot) => {
    set((prev) => {
      const next = {
        ...prev,
        resources: snapshot.resources ?? prev.resources,
        roles: snapshot.roles ?? prev.roles,
        users: snapshot.users ?? prev.users,
      };

      if (snapshot.viewer) {
        if (snapshot.viewer.user) next.user = snapshot.viewer.user;
        if (snapshot.viewer.roles) next.roles = snapshot.viewer.roles;
        if (snapshot.viewer.permissions)
          next.permissions = snapshot.viewer.permissions;
      }

      return next;
    });
  },
  // - What it does:
  //   - For "create": add the new role to the list.
  //   - For "update": replace the matching role by id; if missing, add it anyway.
  //   - For "delete": remove the role with the given id.

  updateRole: (op, payload) => {
    set((prev) => {
      const roles = [...prev.roles];

      if (op === "create") {
        roles.push(payload as Role);
        return { ...prev, roles };
      }

      if (op === "update") {
        const r = payload as Role;
        const idx = roles.findIndex((x) => x.id === r.id);
        if (idx >= 0) roles[idx] = r;
        else roles.push(r);
        return { ...prev, roles };
      }

      if (op === "delete") {
        const { id } = payload as { id: string };
        return { ...prev, roles: roles.filter((r) => r.id !== id) };
      }

      return prev;
    });
  },

  // user create/update events to the users list.
  //   - For "create": add the new user to users[].
  //   - For "update": replace the existing user by id; if not present, add it.
  //   - If the updated user is the currently logged-in user, also update the
  //     store's `user` field so the viewer's profile updates immediately.
  updateUser: (op, payload) => {
    set((prev) => {
      const users = [...prev.users];
      const userPayload = payload as User;

      if (op === "create") {
        users.push(userPayload);
        return { ...prev, users };
      }

      if (op === "update") {
        const idx = users.findIndex((u) => u.id === userPayload.id);
        if (idx >= 0) users[idx] = userPayload;
        else users.push(userPayload);

        const currentUser = get().user;
        if (currentUser && userPayload.id === currentUser.id) {
          // Also update the viewer's own profile
          return { ...prev, users, user: userPayload };
        }

        return { ...prev, users };
      }

      return prev;
    });
  },

  // - Purpose: Handle a targeted permissions update for a specific user.
  //   1. Update or add the profile user in the users[] list.
  //   2. If the profile is for the currently logged-in user, replace the viewer's
  //      user, roles, and permissions so the UI immediately reflects the change.
  //   3. If it targets another user, only update the users[] list.

  setUserPermissions: (profile) => {
    set((prev) => {
      const { user: profileUser, roles, permissions } = profile;
      const users = [...prev.users];
      const idx = users.findIndex((u) => u.id === profileUser.id);

      if (idx >= 0) users[idx] = profileUser;
      else users.push(profileUser);

      if (prev.user && profileUser.id === prev.user.id) {
        // The change affects the current viewer — update viewer data too
        return {
          ...prev,
          users,
          user: profileUser,
          roles,
          permissions,
        };
      }

      // Only the users list changed (other profile updated)
      return { ...prev, users };
    });
  },
}));
