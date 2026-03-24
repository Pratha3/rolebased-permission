"use client";

import Link from "next/link";
import Image from "next/image";
import { FaGithub, FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image height={24} width={24} src="/logo.png" alt="Logo" style={{ width: 'auto', height: 'auto' }} />
              <span className="font-bold">Secure Auth</span>
            </Link>
            <p className="text-sm text-slate-400">
              Secure authentication for modern applications
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/dashboard" className="hover:text-slate-200">Dashboard</Link></li>
              <li><Link href="/profile" className="hover:text-slate-200">Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/contact" className="hover:text-slate-200">Contact</Link></li>
              <li><Link href="/help" className="hover:text-slate-200">Help Center</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/privacy" className="hover:text-slate-200">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-slate-200">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            © 2026 Secure Auth. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-slate-400 hover:text-slate-200">
              <FaXTwitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-slate-200">
              <FaGithub className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
