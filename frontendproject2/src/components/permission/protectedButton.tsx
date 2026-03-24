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
  const ariaLabel = typeof children === "string" ? children : undefined;
  const title = tooltip ?? (disabled ? `Requires ${action} on ${resource}` : undefined);

  
  if (href) {
    return (
      <Link href={href} className={className} aria-label={ariaLabel} title={title} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className} aria-label={ariaLabel} title={title}>
      {children}
    </button>
  );
}