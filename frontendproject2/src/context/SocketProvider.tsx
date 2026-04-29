"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { getSocket, disposeSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/userStore";
import { toast } from "sonner";
import type { Role, Permission } from "@/types/auth";
import { getId } from "@/types/auth";

const SocketContext = createContext<Socket | null>(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const userId = useAuthStore((s) =>s.user?._id);
  const isLoading = useAuthStore((s) => s.isLoading);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isLoading) return;

    console.log("socket connecting, user:", userId || "anonymous");

    const socket = getSocket(userId);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("socket connected");
      toast.success("Realtime connected");
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
      console.log("socket event: role.updated, role:", updatedRole.name);

      const { roles, updateRoleInList, setPermissions } = useAuthStore.getState();
      const updatedId = getId(updatedRole);

      // Only care if current user has this role
      const userHasRole = roles.some((r) => getId(r) === updatedId);
      if (!userHasRole) return;

      updateRoleInList(updatedRole);

      // Recalculate merged permissions from all user roles
      const updatedRoles = useAuthStore.getState().roles;
      const permMap = new Map<string, Set<string>>();

      updatedRoles.forEach((role) => {
        role.permissions?.forEach((perm) => {
          const actions = permMap.get(perm.resource) ?? new Set<string>();
          perm.actions.forEach((a) => actions.add(a));
          permMap.set(perm.resource, actions);
        });
      });

      const newPermissions: Permission[] = Array.from(permMap.entries()).map(([resource, actions]) => ({
        resource,
        actions: Array.from(actions),
      }));

      setPermissions(newPermissions);
      console.log("permissions recalculated, count:", newPermissions.length);
      toast.info(`Your "${updatedRole.name}" role permissions were updated`);
    });

    // user.permissions: backend pre-maps _id → id
    socket.on("user.permissions", (data) => {
      console.log("socket event: user.permissions");

      const { user, permissions: oldPermissions, setUserProfile } = useAuthStore.getState();
      const incomingUserId = data?.user?.id ?? data?.user?._id;

      if (!user || incomingUserId !== (user._id)) return;

      const roles: Role[] = data?.roles ?? [];
      const permissions: Permission[] = data?.permissions ?? [];

      const lostResources = oldPermissions
        .filter((old) => !permissions.find((p) => p.resource === old.resource))
        .map((p) => p.resource);

      setUserProfile(user, roles, permissions);

      if (lostResources.length > 0) {
        toast.warning("Permissions updated by admin", {
          description: `Lost access to: ${lostResources.join(", ")}`,
          duration: 10000,
        });
      } else {
        toast.success("Your permissions were updated");
      }
    });

    socket.connect();

    return () => {
      console.log("socket cleanup");
      socket.removeAllListeners();
    };
  }, [userId, isLoading]);

  useEffect(() => {
    return () => disposeSocket();
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
