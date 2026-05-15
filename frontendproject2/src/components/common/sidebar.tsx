"use client";

import { useAuthStore } from "@/store/userStore";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Shield,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useIsAdmin, useIsMarketing, useIsSales, useIsViewer } from "@/hooks/usePermission";
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

function RoleBadge() {
  const isAdmin = useIsAdmin();
  const isMarketing = useIsMarketing();
  const isSales = useIsSales();
  const isViewer = useIsViewer();

  if (isAdmin)
    return (
      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 px-2 py-0.5 text-[10px] font-semibold text-blue-300 uppercase tracking-wide">
        Admin
      </span>
    );
  if (isMarketing)
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 uppercase tracking-wide">
        Marketing
      </span>
    );
  if (isSales)
    return (
      <span className="inline-flex items-center rounded-full bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 text-[10px] font-semibold text-orange-300 uppercase tracking-wide">
        Sales
      </span>
    );
  if (isViewer)
    return (
      <span className="inline-flex items-center rounded-full bg-slate-500/20 border border-slate-500/30 px-2 py-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
        Viewer
      </span>
    );
  return null;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const isAdmin = useIsAdmin();

  const onLogout = async () => {
    clearAuth();
    router.push("/login");
  };

  const avatarInitial = user?.name?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <div className="flex h-full flex-col bg-slate-900">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-800/70">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-md shrink-0">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold text-white tracking-tight">PermissionHub</span>
      </div>

      {/* User profile */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800/70 bg-slate-800/30">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white shadow">
          {avatarInitial}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-sm font-semibold text-white truncate leading-none">
            {user?.name ?? "User"}
          </span>
          <RoleBadge />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
        <p className="px-3 pt-1 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          Navigation
        </p>

        {navigation.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          const baseClass = `
            group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
            transition-all duration-200 w-full animate-fade-in
          `;

          const activeClasses = isActive
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
            : "text-slate-400 hover:bg-slate-800/60 hover:text-white";

          return (
            <div
              key={item.name}
              className="animate-slide-in-left"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ProtectedButton
                resource={item.resource}
                action={item.action}
                href={item.href}
                className={`${baseClass} ${activeClasses}`}
                tooltip={
                  item.variant === "disable"
                    ? `Requires ${item.action} on ${item.resource}`
                    : undefined
                }
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur-xl" />
                )}
                <Icon
                  className={`relative h-4 w-4 shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"
                  }`}
                />
                <span className="relative truncate">{item.name}</span>
                {isActive && (
                  <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-white/70" />
                )}
              </ProtectedButton>
            </div>
          );
        })}

        {isAdmin && (
          <>
            <p className="px-3 pt-4 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Admin
            </p>
            <button
              type="button"
              onClick={() => router.push("/access")}
              className={`
                group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                transition-all duration-200 animate-slide-in-left
                ${pathname === "/access"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"}
              `}
              style={{ animationDelay: `${navigation.length * 50}ms` }}
            >
              <Shield
                className={`relative h-4 w-4 shrink-0 transition-colors ${
                  pathname === "/access" ? "text-white" : "text-slate-500 group-hover:text-blue-400"
                }`}
              />
              <span className="relative truncate">Access Control</span>
              {pathname === "/access" && (
                <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-white/70" />
              )}
            </button>
          </>
        )}
      </nav>

      {/* Footer actions */}
      <div className="border-t border-slate-800/70 p-3 space-y-0.5">
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-all duration-200 w-full group"
        >
          <User className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-blue-400 transition-colors" />
          <span className="truncate">Profile</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 w-full group"
        >
          <LogOut className="h-4 w-4 shrink-0 transition-colors" />
          <span className="truncate">Logout</span>
        </button>
      </div>
    </div>
  );
}
