"use client";

import Footer from "@/components/common/footer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsAdmin } from "@/hooks/usePermission";
import {
  createRole,
  createUser,
  deleteRole,
  getResources,
  getRoles,
  getUserPermissions,
  getUsers,
  updateRole,
  updateUser,
} from "@/services/admin";
import { Permission, Profile, Resource, Role, User, getId } from "@/types/auth";
import {
  Check,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Tab = "roles" | "users" | "permissions";

type RoleForm = {
  id?: string;
  name: string;
  description: string;
  permissions: Permission[];
};

const emptyRoleForm: RoleForm = { name: "", description: "", permissions: [] };

export default function AccessPage() {
  const isAdmin = useIsAdmin();
  const [activeTab, setActiveTab] = useState<Tab>("roles");
  const [resources, setResources] = useState<Resource[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [roleForm, setRoleForm] = useState<RoleForm>(emptyRoleForm);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

  const roleMap = useMemo(
    () => new Map(roles.map((role) => [getId(role), role])),
    [roles],
  );

  useEffect(() => {
    if (!isAdmin) return;
    void loadAdminData();
  }, [isAdmin]);

  async function loadAdminData() {
    try {
      setLoading(true);
      const [resourceList, roleList, userList] = await Promise.all([
        getResources(),
        getRoles(),
        getUsers(),
      ]);
      setResources(resourceList);
      setRoles(roleList);
      setUsers(userList);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function hasAction(resourceId: string, action: string) {
    return (
      roleForm.permissions
        .find((p) => p.resource === resourceId)
        ?.actions.includes(action) ?? false
    );
  }

  function toggleAction(resourceId: string, action: string, checked: boolean) {
    setRoleForm((current) => {
      const permissions = [...current.permissions];
      const index = permissions.findIndex((item) => item.resource === resourceId);
      if (index === -1 && checked) {
        permissions.push({ resource: resourceId, actions: [action] });
      } else if (index !== -1) {
        const nextActions = checked
          ? Array.from(new Set([...permissions[index].actions, action]))
          : permissions[index].actions.filter((item) => item !== action);
        if (nextActions.length) {
          permissions[index] = { ...permissions[index], actions: nextActions };
        } else {
          permissions.splice(index, 1);
        }
      }
      return { ...current, permissions };
    });
  }

  async function handleRoleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!roleForm.name.trim()) { toast.error("Role name is required"); return; }
    try {
      setSavingRole(true);
      const payload = {
        name: roleForm.name.trim(),
        description: roleForm.description.trim(),
        permissions: roleForm.permissions,
      };
      if (roleForm.id) {
        await updateRole(roleForm.id, payload);
        toast.success("Role updated");
      } else {
        await createRole(payload);
        toast.success("Role created");
      }
      setRoleForm(emptyRoleForm);
      await loadAdminData();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSavingRole(false);
    }
  }

  async function confirmDeleteRole() {
    if (!deleteTarget) return;
    try {
      await deleteRole(getId(deleteTarget));
      toast.success("Role deleted");
      if (roleForm.id === getId(deleteTarget)) setRoleForm(emptyRoleForm);
      await loadAdminData();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setDeleteTarget(null);
    }
  }

  async function handleUserSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.password.trim()) {
      toast.error("Name, email, and password are required");
      return;
    }
    try {
      setSavingUser(true);
      await createUser({
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        password: userForm.password,
        roleIds: [],
      });
      setUserForm({ name: "", email: "", password: "" });
      toast.success("User created");
      await loadAdminData();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSavingUser(false);
    }
  }

  async function toggleUserRole(user: User, roleId: string, checked: boolean) {
    const nextRoleIds = checked
      ? Array.from(new Set([...(user.roleIds ?? []), roleId]))
      : (user.roleIds ?? []).filter((id) => id !== roleId);
    try {
      await updateUser(getId(user), { roleIds: nextRoleIds });
      setUsers((current) =>
        current.map((item) =>
          getId(item) === getId(user) ? { ...item, roleIds: nextRoleIds } : item,
        ),
      );
      toast.success("User roles updated");
      if (selectedProfile?.user && getId(selectedProfile.user) === getId(user)) {
        setSelectedProfile(await getUserPermissions(getId(user)));
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  async function viewPermissions(userId: string) {
    try {
      setSelectedProfile(await getUserPermissions(userId));
      setActiveTab("permissions");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center animate-fade-in">
        <Card className="max-w-md text-center border-slate-200 dark:border-slate-800 shadow-lg">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <Shield className="h-6 w-6 text-red-500" />
            </div>
            <CardTitle className="text-lg">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            Only administrators can manage roles and users.
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof Shield }[] = [
    { key: "roles", label: "Role Builder", icon: Shield },
    { key: "users", label: "User Management", icon: Users },
    { key: "permissions", label: "Permission View", icon: Check },
  ];

  return (
    <div className="space-y-6">
      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the role and remove it from all assigned users. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
              onClick={() => void confirmDeleteRole()}
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Access Control</h1>
          <p className="text-sm text-slate-500">Manage roles, permissions, and user assignments.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadAdminData()} disabled={loading} className="gap-1.5">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </Button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 animate-fade-in animation-delay-100">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Roles */}
      {activeTab === "roles" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr] animate-fade-in">
          {/* Role builder form */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-blue-500" />
                {roleForm.id ? "Edit Role" : "Create New Role"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <form className="space-y-5" onSubmit={handleRoleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="role-name" className="text-sm">Role name <span className="text-red-500">*</span></Label>
                    <Input
                      id="role-name"
                      value={roleForm.name}
                      onChange={(e) => setRoleForm((c) => ({ ...c, name: e.target.value }))}
                      placeholder="Content Editor"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="role-description" className="text-sm">Description</Label>
                    <Input
                      id="role-description"
                      value={roleForm.description}
                      onChange={(e) => setRoleForm((c) => ({ ...c, description: e.target.value }))}
                      placeholder="Can manage blog content"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Permissions</p>
                  {resources.map((resource) => (
                    <div key={getId(resource)} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-white capitalize">{resource.name}</h3>
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-500">
                          {getId(resource)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {resource.actions.map((action) => {
                          const id = `${getId(resource)}-${action}`;
                          return (
                            <Label
                              key={id}
                              htmlFor={id}
                              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <Checkbox
                                id={id}
                                checked={hasAction(getId(resource), action)}
                                onCheckedChange={(checked) =>
                                  toggleAction(getId(resource), action, checked === true)
                                }
                              />
                              {action}
                            </Label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button type="submit" disabled={savingRole} className="gap-1.5">
                    {savingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    {roleForm.id ? "Update Role" : "Create Role"}
                  </Button>
                  {roleForm.id && (
                    <Button type="button" variant="outline" onClick={() => setRoleForm(emptyRoleForm)} className="gap-1.5">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Existing roles */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base">Existing Roles ({roles.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {roles.map((role, i) => (
                  <div
                    key={getId(role)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-all hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{role.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{role.description || "No description"}</p>
                        <p className="mt-1 text-[10px] font-mono text-slate-400">{getId(role)}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-8 text-xs"
                          onClick={() =>
                            setRoleForm({
                              id: getId(role),
                              name: role.name,
                              description: role.description ?? "",
                              permissions: role.permissions ?? [],
                            })
                          }
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:border-red-200"
                          onClick={() => setDeleteTarget(role)}
                          disabled={getId(role) === "role_admin"}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(role.permissions ?? []).map((permission) => (
                        <span
                          key={`${getId(role)}-${permission.resource}`}
                          className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[10px] font-medium text-blue-600"
                        >
                          {permission.resource}: {permission.actions.join(", ")}
                        </span>
                      ))}
                      {(!role.permissions || role.permissions.length === 0) && (
                        <span className="text-xs text-slate-400">No permissions assigned</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === "users" && (
        <div className="space-y-6 animate-fade-in">
          {/* Create user */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-4 w-4 text-blue-500" />
                Create New User
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <form className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={handleUserSubmit}>
                <Input
                  value={userForm.name}
                  onChange={(e) => setUserForm((c) => ({ ...c, name: e.target.value }))}
                  placeholder="Full name"
                  className="h-10"
                />
                <Input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm((c) => ({ ...c, email: e.target.value }))}
                  placeholder="Email address"
                  className="h-10"
                />
                <Input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm((c) => ({ ...c, password: e.target.value }))}
                  placeholder="Password"
                  className="h-10"
                />
                <Button type="submit" disabled={savingUser} className="h-10 gap-1.5 shrink-0">
                  {savingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add User
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* User role assignments */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-blue-500" />
                User Role Assignments ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {users.map((user, i) => (
                  <div
                    key={getId(user)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-all hover:border-slate-300 dark:hover:border-slate-600 animate-fade-in"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                          {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void viewPermissions(getId(user))}
                        className="gap-1.5 text-xs h-8 shrink-0"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        View Permissions
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {roles.map((role) => {
                        const checkboxId = `${getId(user)}-${getId(role)}`;
                        const isAssigned = (user.roleIds ?? []).includes(getId(role));
                        return (
                          <Label
                            key={checkboxId}
                            htmlFor={checkboxId}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                              isAssigned
                                ? "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800"
                                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            <Checkbox
                              id={checkboxId}
                              checked={isAssigned}
                              onCheckedChange={(checked) =>
                                void toggleUserRole(user, getId(role), checked === true)
                              }
                            />
                            {roleMap.get(getId(role))?.name ?? getId(role)}
                          </Label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Permissions */}
      {activeTab === "permissions" && (
        <div className="animate-fade-in">
          {selectedProfile ? (
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                    {selectedProfile.user.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Effective Permissions — {selectedProfile.user.name}
                    </CardTitle>
                    <p className="text-xs text-slate-500">{selectedProfile.user.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {selectedProfile.permissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 py-10 text-center">
                    <Shield className="h-8 w-8 text-slate-300 mb-3" />
                    <p className="text-sm text-slate-500">No permissions assigned</p>
                    <p className="text-xs text-slate-400 mt-1">Assign roles to this user to grant permissions</p>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {selectedProfile.permissions.map((permission, i) => (
                      <div
                        key={permission.resource}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-all hover:border-blue-200 dark:hover:border-blue-800 animate-fade-in"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <p className="font-semibold text-sm text-slate-900 dark:text-white capitalize mb-2">
                          {permission.resource}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {permission.actions.map((action) => (
                            <span
                              key={action}
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-medium text-emerald-600"
                            >
                              <Check className="h-2.5 w-2.5" />
                              {action}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 py-16 text-center animate-fade-in">
              <Shield className="h-10 w-10 text-slate-300 mb-4" />
              <p className="text-sm font-medium text-slate-500">No user selected</p>
              <p className="text-xs text-slate-400 mt-1">
                Go to <strong>User Management</strong> and click{" "}
                <strong>View Permissions</strong> on a user
              </p>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
