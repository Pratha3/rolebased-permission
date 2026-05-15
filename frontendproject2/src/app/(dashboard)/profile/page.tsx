"use client";

import Footer from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/services/admin";
import { useAuthStore } from "@/store/userStore";
import { getId } from "@/types/auth";
import { KeyRound, Loader2, Shield, User } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const permissions = useAuthStore((state) => state.permissions);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Current and new password are required");
      return;
    }

    try {
      setIsSaving(true);
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password changed");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-slate-500">View your account, roles, and effective permissions.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Name</p>
              <p className="font-semibold">{user?.name ?? "Unknown user"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-semibold">{user?.email ?? "-"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Roles</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {roles.map((role) => (
                  <span key={getId(role)} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                    {role.name}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]" onSubmit={handlePasswordSubmit}>
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </div>
              <Button type="submit" className="self-end" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Update
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Effective Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {permissions.map((permission) => (
              <div key={permission.resource} className="rounded-lg border p-3">
                <p className="font-semibold">{permission.resource}</p>
                <p className="mt-1 text-sm text-slate-500">{permission.actions.join(", ")}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Footer />
    </div>
  );
}
