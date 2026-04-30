"use client";
import { usePermission } from "@/hooks/usePermission";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface ProtectedSectionProps {
  resource: string;
  action: string;
  fallback?: ReactNode;
  children: ReactNode;
  redirectTo?: string;
}

export function ProtectedSection({
  resource,
  action,
  fallback = null,
  children,
  redirectTo = "/dashboard?error=unauthorized"
}: ProtectedSectionProps) {
  const hasPermission = usePermission(resource, action);
  const router = useRouter();

  useEffect(() => {
    if (!hasPermission) {
      // replace prevents the "back-button loop"
      router.replace(redirectTo);
    }
  }, [hasPermission, router, redirectTo]);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
