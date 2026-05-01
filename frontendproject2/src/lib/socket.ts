"use client";

import { use } from "react";
import { io, Socket } from "socket.io-client";
const URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

let socketInstance: Socket | null = null;
let currentUserId: string | undefined = undefined;

export function createSocket(user?: string) {
  return io(URL, {
    path: "/ws",
    autoConnect: false,
    reconnection: true,
    // query: user ? { userId: user } : {},
    auth: user ? { userId: user } : {},
  });
}
export function getSocket(userId?: string) {
  if (socketInstance && currentUserId !== userId) {
    console.log("socket userid changed, recreating connection");
    console.log("old userid:", currentUserId);
    console.log("new userid:", userId);
    disposeSocket();
  }

  if (!socketInstance) {
    console.log("socket creating new instance");
    console.log("userid:", userId || "anonymous");
    socketInstance = createSocket(userId);
    currentUserId = userId;
  }

  return socketInstance;
}
export function disposeSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance.removeAllListeners();
    currentUserId = undefined;
    socketInstance = null;
  }
}

export function getCurrentUserId() {
  return currentUserId;
}
