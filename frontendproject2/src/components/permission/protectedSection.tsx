"use client";
import { usePermission } from "@/hooks/usePermission";
import { ReactNode } from "react";

interface ProtectedSectionProps {
  resource: string;
  action: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function ProtectedSection({
  resource,
  action,
  fallback = null,
  children,
}: ProtectedSectionProps) {
  const hasPermission = usePermission(resource, action);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
