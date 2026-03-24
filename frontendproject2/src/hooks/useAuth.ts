"use client";
//check fo token onMount and fetch profile from url 
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
  const intializeAuth = useAuthStore((s) => s.intializeAuth);
  const setUserProfile = useAuthStore((s) => s.setUserProfile);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    intializeAuth();
  }, [intializeAuth]);

  useEffect(() => {
    if (!token) return;
    if (user) return;

    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        setAuthToken(token);

        const profile = await getMe();

        if (!mounted) return;

        setUserProfile(profile.user, profile.roles, profile.permissions);
      } catch (err) {
        if (!mounted) return;

        const status = (err as any)?.response?.status;
        if (status === 401) {
          clearAuth();
        } else {
          console.error("Failed to fetch profile (will not clear auth):", err);
        }
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token, user, setUserProfile, clearAuth, setLoading, router, pathname]);

  return {
    token,
    user,
    isLoading,
    isAuthenticated: !!token && !!user,
    clearAuth,
  };
}
