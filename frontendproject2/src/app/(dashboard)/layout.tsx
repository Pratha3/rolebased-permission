"use client";

import { Sidebar } from "@/components/common/sidebar";
import { PermissionWatcher } from "@/components/permission/permissionwatcher";
import { useAuthStore } from "@/store/userStore";
import { Bell, Menu, Search, X } from "lucide-react";
import { useRef, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const user = useAuthStore((s) => s.user);

  const avatarInitial = user?.name?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <PermissionWatcher />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:w-60 shrink-0 flex-col border-r border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900">
          <Sidebar />
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          {/* Top header */}
          <header className="z-20 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex h-14 items-center justify-between gap-4 px-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileOpen(true)}
                  className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <h1 className="font-semibold text-slate-800 dark:text-white text-sm">
                  Admin Panel
                </h1>
              </div>

              {/* Search */}
              <div className="hidden md:flex flex-1 max-w-sm">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="search"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search…"
                    className="h-9 w-full rounded-lg bg-slate-100 dark:bg-slate-800 pl-9 pr-3 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                  />
                </div>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-2">
                <button
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500" />
                </button>

                <button
                  onClick={() => {}}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all"
                  aria-label="User menu"
                >
                  {avatarInitial}
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          <aside
            className="fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto bg-gradient-to-b from-slate-950 to-slate-900 shadow-2xl md:hidden animate-slide-in-left"
            role="dialog"
            aria-label="Mobile menu"
          >
            <div className="flex items-center justify-end px-4 py-3 border-b border-slate-800/70">
              <button
                ref={closeBtnRef}
                className="inline-flex items-center justify-center rounded-lg p-2 text-slate-300 hover:bg-slate-800 transition-colors"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar />
          </aside>
        </>
      )}
    </div>
  );
}
