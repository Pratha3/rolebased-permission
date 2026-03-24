"use client";

import { Sidebar } from "@/components/common/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/userStore";
import { Menu, Search, X } from "lucide-react";
import { useRef, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  
  

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:block md:w-60 border-r border-slate-800 bg-linear-to-b from-slate-950 to-slate-900">
          <Sidebar />
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="z-20 w-full border-b border-slate-800 bg-linear-to-br">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMobileOpen(true)}
                  className="inline-flex items-center justify-center rounded p-2 text-slate-200 md:hidden"
                  aria-label="Open menu"
                  aria-expanded={isMobileOpen}
                >
                  <Menu className="h-6 w-6" />
                </button>

                <h1 className="font-semibold text-white">Admin panel</h1>
              </div>

              <div className="hidden md:flex md:items-center md:gap-2">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search"
                    className="h-9 w-80 rounded-md bg-slate-900/60 px-3 pr-9 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    aria-label="Search"
                  />
                  <Search className="absolute right-2 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-linear-to-br p-6">
            {children}
          </main>
        </div>
      </div>

      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          <aside
            className="fixed inset-y-0 left-0 z-50 w-64 transform overflow-y-auto bg-linear-to-b from-slate-950 to-slate-900 shadow-lg transition-transform duration-300 md:hidden"
            role="dialog"
            aria-label="Mobile menu"
          >
            <div className="flex items-center justify-end px-4 py-3 border-b border-slate-800">
              <button
                ref={closeBtnRef}
                className="inline-flex items-center justify-center rounded p-2 text-slate-200 hover:bg-slate-800"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <Sidebar />
          </aside>
        </>
      )}
    </div>
  );
}
