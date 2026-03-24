"use client";

import { useAuthStore } from "@/store/userStore";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Logout() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const onLogout = () => {
    clearAuth();
    toast.success("Logged out successfully!");
    router.push("/login");
  };

  return (
    <button
      onClick={onLogout}
      className="flex items-center gap-2 w-full text-left"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  );
}
