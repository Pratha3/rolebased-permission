"use client";

import { usePermission } from "@/hooks/usePermission";
import Link from "next/link";
import { ReactNode } from "react";

interface ProtectedButtonProps {
  resource: string;
  action: string;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "hide" | "disable";
  className?: string;
  tooltip?: string;
}

export function ProtectedButton({
  resource,
  action,
  href,
  onClick,
  children,
  className,
  variant = "hide",
  tooltip,
}: ProtectedButtonProps) {
  const hasPermission = usePermission(resource, action);
  if (!hasPermission && variant === "hide") return null;

  const disabled = !hasPermission && variant === "disable";
  const title = tooltip ?? (disabled ? `Requires ${action} on ${resource}` : undefined);

  if (href && !disabled) {
    return (
      <Link href={href} className={className} title={title} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={className}
      title={title}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}
