"use client";

import { useAuth } from "@/hooks/useAuth";
import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  useAuth();

  return <>{children}</>;
}
