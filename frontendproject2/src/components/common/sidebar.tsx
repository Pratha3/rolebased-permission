"use client";

import { useAuthStore } from "@/store/userStore";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ProtectedButton } from "../permission/protectedButton";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    resource: "dashboard",
    action: "view",
    variant: "hide",
  },
  {
    name: "Blogs",
    href: "/blogs",
    icon: FileText,
    resource: "blogs",
    action: "view",
    variant: "disable",
  },
  {
    name: "Inquiries",
    href: "/inquiries",
    icon: MessageSquare,
    resource: "inquiries",
    action: "view",
    variant: "hide",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    resource: "analytics",
    action: "view",
    variant: "hide",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const onLogout = async () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <div className="flex h-full flex-col bg-slate-900">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800">
        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
          <User className="h-5 w-5 text-slate-400" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-semibold text-white truncate">
            {user?.name ?? "User"}
          </span>
          <span className="text-xs text-slate-400 truncate">
            {user?.email ?? ""}
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          const baseClass = `
            group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
            transition-all duration-200 w-full
          `;

          const activeClasses = isActive
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50"
            : "text-slate-400 hover:bg-slate-800/50 hover:text-white";
          const visualClass = `${baseClass} ${activeClasses}`;

          return (
            <ProtectedButton
              key={item.name}
              resource={item.resource}
              action={item.action}
              href={item.href}
              className={visualClass}
              tooltip={
                item.variant === "disable"
                  ? `Requires ${item.action} on ${item.resource}`
                  : undefined
              }
            >
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 opacity-20 blur-xl" />
              )}
              <Icon
                className={`relative h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"}`}
              />
              <span className="relative truncate">{item.name}</span>
            </ProtectedButton>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 w-full"
          >
            <User className="h-4 w-4 shrink-0" />
            <span className="truncate">Profile</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-red-600/10 w-full"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="truncate">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
