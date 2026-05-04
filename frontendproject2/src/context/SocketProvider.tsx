"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { getSocket, disposeSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/userStore";
import { toast } from "sonner";
import type { Role, Permission } from "@/types/auth";
import { getId } from "@/types/auth";
import { useRouter } from "next/navigation";

const SocketContext = createContext<Socket | null>(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?._id);
  const isLoading = useAuthStore((s) => s.isLoading);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isLoading) return;

    console.log("socket connecting, user:", userId || "anonymous");

    const socket = getSocket(userId);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("socket connected");
      router.refresh();
    });

    socket.on("connect_error", (err) => {
      console.error("socket error:", err.message);
    });

    // snapshot.viewer is pre-mapped by backend (has id), snapshot.roles/users are raw (_id)
    socket.on("snapshot", (payload) => {
      console.log("socket event: snapshot");
      const { setUserProfile, user } = useAuthStore.getState();

      if (payload?.viewer && user) {
        const roles: Role[] = payload.viewer.roles ?? [];
        const permissions: Permission[] = payload.viewer.permissions ?? [];
        setUserProfile(user, roles, permissions);
      }
    });

    // role.updated: raw mongo doc, may have _id
    socket.on("role.updated", (updatedRole: Role) => {
      const store = useAuthStore.getState();
      const updatedId = getId(updatedRole);

      // 1. Verify the user actually possesses this role
      const hasThisRole = store.roles.some((r) => getId(r) === updatedId);
      if (!hasThisRole) return;

      // 2. Perform the update in the store
      store.updateRoleInList(updatedRole);

      // 3. IMPORTANT: Get the NEW roles array from the store AFTER updateRoleInList
      const freshRoles = useAuthStore.getState().roles;

      const permMap = new Map<string, Set<string>>();

      // 4. Recalculate using the FRESH data
      freshRoles.forEach((role) => {
        role.permissions?.forEach((perm) => {
          const actions = permMap.get(perm.resource) ?? new Set<string>();
          perm.actions.forEach((a) => actions.add(a));
          permMap.set(perm.resource, actions);
        });
      });

      const newPermissions: Permission[] = Array.from(permMap.entries()).map(
        ([resource, actions]) => ({
          resource,
          actions: Array.from(actions),
        }),
      );

      // 5. Update permissions - this triggers the Zustand subscription and the UI
      store.setPermissions(newPermissions);

      console.log("✅ UI Sync: Permissions recalculated from updated role");
      toast.success(`Role "${updatedRole.name}" updated`);

      // router.refresh() handles Server Components, Zustand handles the rest
      router.refresh();
    });

    // user.permissions: backend pre-maps _id → id
    socket.on("user.permissions", (data) => {
      console.log("socket event: user.permissions", data);

      const state = useAuthStore.getState();
      const currentUser = state.user;
      const oldPermissions = state.permissions;

      if (!currentUser) return;

      // FIX 1: Handle both object and string ID from backend
      const incomingUserId = data?.user?._id || data?.user?.id || (typeof data?.user === "string" ? data.user : null);

      // FIX 2: Ensure ID comparison is robust
     if (!incomingUserId || incomingUserId.toString() !== currentUser._id.toString()) {
      console.warn("ID mismatch. Current:", currentUser._id, "Incoming:", incomingUserId);
      return;
  }

      const newRoles = data?.roles ?? [];
      const newPermissions = data?.permissions ?? [];

      // FIX 3: Check for lost resources BEFORE updating state
      const lostResources = oldPermissions
        .filter(
          (old) => !newPermissions.find(function (p: { resource: string; }) {
            return p.resource === old.resource;
          }),
        )
        .map((p) => p.resource);

      // Update Zustand (Zustand handles the reactivity)
      state.setUserProfile(currentUser, [...newRoles], [...newPermissions]);

      // UI Feedback
      if (lostResources.length > 0) {
        toast.warning("Permissions updated", {
          description: `Lost access to: ${lostResources.join(", ")}`,
          duration: 10000,
        });
      } else {
        toast.success("Your permissions were updated");
      }

      // Next.js refresh
      setTimeout(() => {
        router.refresh();
      }, 100);
    });

    socket.connect();

    return () => {
      console.log("socket cleanup");
      socket.removeAllListeners();
    };
  }, [userId, isLoading, router]);

  useEffect(() => {
    return () => disposeSocket();
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
