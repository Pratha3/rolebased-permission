"use client";

import { ReactNode } from "react";
import { usePermission } from "@/hooks/usePermission";

interface ProtectedPageProps {
  resource: string;
  action: string;
  children: ReactNode;
}

export function ProtectedPage({
  resource,
  action,
  children,
}: ProtectedPageProps) {
  // usePermission hook checks if current user has the required permission
  // by looking at their roles and permissions from the auth store.

  const hasPermission = usePermission(resource, action);

  //if user doesn't have permission, show a clear message
  //instead of just hiding the page or showing an error.

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Access</h2>
          <p className="text-gray-600">
            You don't have permission to view this page.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Required: {action} access to {resource}
          </p>
        </div>
      </div>
    );
  }

  //if user has permission, render the actual page content.

  return <>{children}</>;
}
