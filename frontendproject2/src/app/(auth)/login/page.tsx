"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  loginDefaultValues,
  loginSchema,
  type LoginFormValues,
} from "@/lib/validations";
import { login } from "@/services/auth";
import { useAuthStore } from "@/store/userStore";

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefaultValues,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await login(data.email, data.password);
      setToken(response.token);
      return response;
    },
    onSuccess: () => {
      toast.success("Login successful!");
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Login failed");
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-md animate-fade-in-up">
      {/* Logo / brand mark */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30 animate-scale-in">
          <Shield className="h-7 w-7 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Permission Manager
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Role-based access control system
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl animate-scale-in animation-delay-100">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Welcome back</h2>
          <p className="mt-1 text-sm text-white/60">
            Sign in to your account to continue
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80 text-sm font-medium">
                    Email address
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="you@example.com"
                        disabled={loginMutation.isPending}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-blue-400 focus:ring-blue-400/20 h-11 rounded-xl transition-all"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80 text-sm font-medium">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={loginMutation.isPending}
                        className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-blue-400 focus:ring-blue-400/20 h-11 rounded-xl transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300 text-xs" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none mt-2"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </Form>

        {/* Demo hint */}
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-white/50 font-medium mb-1.5">Demo credentials</p>
          <div className="space-y-1 text-xs text-white/60">
            <p><span className="text-white/40">Admin:</span> admin@example.com / password</p>
            <p><span className="text-white/40">Marketing:</span> marketing@example.com / password</p>
          </div>
        </div>
      </div>
    </div>
  );
}
