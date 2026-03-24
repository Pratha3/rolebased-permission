"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logout from "./logout";

import { User, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/userStore";

export default function Header() {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/login-2fa/verify";

  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [isMobileOpen, setIsMobileOpen] = useState(false); 
  const { user } = useAuthStore();

  return (
    <nav className="w-full border-b border-slate-800 bg-slate-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center">
          {/* Left: Logo */}
          <div className="flex flex-1 items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                height={32}
                width={32}
                src="/logo.png"
                alt="Logo"
                style={{ width: "auto", height: "auto" }}
              />
              <span className="text-lg font-semibold text-white">Secure Auth</span>
            </Link>
          </div>

         
          {!isAuthPage && (
            <div className="pointer-events-none absolute left-1/2 top-0 flex -translate-x-1/2 items-center h-16">
              <div className="pointer-events-auto hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-sm text-slate-200 hover:text-white">
                  Dashboard
                </Link>
                <Link href="/blogs" className="text-sm text-slate-200 hover:text-white">
                  Blogs
                </Link>
                <Link href="/inquiries" className="text-sm text-slate-200 hover:text-white">
                  Inquiries
                </Link>
                <Link href="/analytics" className="text-sm text-slate-200 hover:text-white">
                  Analytics
                </Link>
              </div>
            </div>
          )}

         
          <div className="flex flex-1 items-center justify-end gap-4">
            {!isAuthPage && (
              <>
         
                <div className="relative">
                  <button
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen((s) => !s)}
                    className="inline-flex items-center gap-2 rounded px-2 py-1 text-sm text-slate-200"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">{user?.name ?? "Account"}</span>
                  </button>

                  {isMenuOpen && (
                    <div
                      role="menu"
                      aria-orientation="vertical"
                      aria-label="account"
                      className="absolute right-0 mt-2 w-48 overflow-hidden rounded bg-slate-800 border border-slate-700 shadow-lg z-50"
                    >
                      <div className="px-4 py-2 border-b border-slate-700">
                        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      </div>
                      <div className="px-4 py-2">
                        <Logout />
                      </div>
                    </div>
                  )}
                </div>            
               
              </>
            )}
          </div>
        </div>
      </div>

  
      {!isAuthPage && (
        <div className={`md:hidden ${isMobileOpen ? "block" : "hidden"} border-t border-slate-800 bg-slate-900`}>
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex flex-col space-y-2">
              <Link href="/dashboard" onClick={() => setIsMobileOpen(false)} className="py-2 text-slate-200 hover:text-white">
                Dashboard
              </Link>
              <Link href="/blogs" onClick={() => setIsMobileOpen(false)} className="py-2 text-slate-200 hover:text-white">
                Blogs
              </Link>
              <Link href="/inquiries" onClick={() => setIsMobileOpen(false)} className="py-2 text-slate-200 hover:text-white">
                Inquiries
              </Link>
              <Link href="/analytics" onClick={() => setIsMobileOpen(false)} className="py-2 text-slate-200 hover:text-white">
                Analytics
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}