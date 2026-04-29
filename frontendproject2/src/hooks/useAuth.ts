"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/userStore";
import { setAuthToken } from "@/lib/cookies";
import { getMe } from "@/services/auth";

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const setUserProfile = useAuthStore((s) => s.setUserProfile);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // Step 1: read token from cookie into store
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Step 2: once token is available, fetch user profile
  useEffect(() => {
    if (!token || user) return;

    let mounted = true;
    (async () => {
      try {
        setAuthToken(token);
        const profile = await getMe();
        if (!mounted) return;
        setUserProfile(profile.user, profile.roles, profile.permissions);
      } catch (err) {
        if (!mounted) return;
        const status = (err as any)?.response?.status;
        if (status === 401) clearAuth();
      }
    })();

    return () => { mounted = false; };
  }, [token, user, setUserProfile, clearAuth, router, pathname]);

  return { token, user, isLoading, isAuthenticated: !!token && !!user, clearAuth };
}
