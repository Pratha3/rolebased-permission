"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Socket } from "socket.io-client";
import { getSocket, disposeSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/userStore";
import { normalizeId, normalizeList } from "@/lib/normalize";
import { toast } from "sonner";

interface SocketProviderProps {
  children: React.ReactNode;
}

const SocketContext = createContext<Socket | null>(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: SocketProviderProps) => {
  
  const userId = useAuthStore((s) => s.user?.id);
  const token = useAuthStore((s) => s.token);

  
  const setSnapshot = useAuthStore((s) => s.setSnapshot);
  const updateRole = useAuthStore((s) => s.updateRole);
  const updateUser = useAuthStore((s) => s.updateUser);
  const setUserPermissions = useAuthStore((s) => s.setUserPermissions);

  
  const [socket] = useState<Socket>(() => getSocket());

  useEffect(() => {
    if (!socket) return;
    if (token) socket.auth = { token };
    else if (userId) socket.auth = { userId };

    
    const onConnect = (..._args: any[]) => {
      console.debug("socket connected");
      toast.success("Realtime connected");
    };

    const onConnectError = (...args: any[]) => {
      const err = args[0];
      console.error("socket connect_error", err);
      toast.error("Realtime connection error");
 
    };

    const onSnapshot = (...args: any[]) => {
      const payload = args[0];
      const snapshot = {
        resources: normalizeList(payload?.resources),
        roles: normalizeList(payload?.roles),
        users: normalizeList(payload?.users),
        viewer: payload?.viewer
          ? {
              user: payload.viewer.user
                ? normalizeId(payload.viewer.user)
                : undefined,
              roles: payload.viewer.roles
                ? normalizeList(payload.viewer.roles)
                : undefined,
              permissions: payload.viewer.permissions ?? undefined,
            }
          : undefined,
      };
      setSnapshot(snapshot);
      toast("Permissions snapshot received", { description: "Realtime data synchronized" });
    };

    const onRoleCreated = (...args: any[]) => {
      const role = normalizeId(args[0]);
      updateRole("create", role);
      toast.success(`Role created: ${role.name ?? role.id}`);
    };

    const onRoleUpdated = (...args: any[]) => {
      const role = normalizeId(args[0]);
      updateRole("update", role);
      toast.success(`Role updated: ${role.name ?? role.id}`);
    };

    const onRoleDeleted = (...args: any[]) => {
      const payload = args[0] ?? {};
      const id = payload.id ?? payload._id;
      updateRole("delete", { id });
      toast(`${payload.name ?? id} role deleted`);
    };

    const onUserCreated = (...args: any[]) => {
      const user = normalizeId(args[0]);
      updateUser("create", user);
      toast.success(`User created: ${user.name ?? user.email ?? user.id}`);
    };

    const onUserUpdated = (...args: any[]) => {
      const user = normalizeId(args[0]);
      updateUser("update", user);

      
      if (userId && user.id === userId) {
        toast.success("Your profile was updated");
      } else {
        toast(`User updated: ${user.name ?? user.email ?? user.id}`);
      }
    };

    const onUserPermissions = (...args: any[]) => {
      const p = args[0];
      const profile = {
        user: normalizeId(p?.user),
        roles: normalizeList(p?.roles),
        permissions: p?.permissions ?? [],
      };
      setUserPermissions(profile);

      
      if (profile.user && profile.user.id && profile.user.id === userId) {
        toast.success("Your permissions changed");
      } 
    };

    // register listeners
    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("snapshot", onSnapshot);

    socket.on("role.created", onRoleCreated);
    socket.on("role.updated", onRoleUpdated);
    socket.on("role.deleted", onRoleDeleted);

    socket.on("user.created", onUserCreated);
    socket.on("user.updated", onUserUpdated);

    socket.on("user.permissions", onUserPermissions);

    
    socket.connect();

    
    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("snapshot", onSnapshot);

      socket.off("role.created", onRoleCreated);
      socket.off("role.updated", onRoleUpdated);
      socket.off("role.deleted", onRoleDeleted);

      socket.off("user.created", onUserCreated);
      socket.off("user.updated", onUserUpdated);

      socket.off("user.permissions", onUserPermissions);

     
    };
   
  }, [
    socket,
    userId,
    token,
    setSnapshot,
    updateRole,
    updateUser,
    setUserPermissions,
  ]);

  const value = useMemo(() => socket, [socket]);
  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};