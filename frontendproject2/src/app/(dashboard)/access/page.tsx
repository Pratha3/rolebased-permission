"use client";

import Footer from "@/components/common/footer";
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
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type RoleForm = {
  id?: string;
  name: string;
  description: string;
  permissions: Permission[];
};

const emptyRoleForm: RoleForm = {
  name: "",
  description: "",
  permissions: [],
};

export default function AccessPage() {
  const isAdmin = useIsAdmin();
  const [resources, setResources] = useState<Resource[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [roleForm, setRoleForm] = useState<RoleForm>(emptyRoleForm);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState(false);
  const [savingUser, setSavingUser] = useState(false);

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
    return roleForm.permissions
      .find((permission) => permission.resource === resourceId)
      ?.actions.includes(action) ?? false;
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
    if (!roleForm.name.trim()) {
      toast.error("Role name is required");
      return;
    }

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

  async function handleDeleteRole(roleId: string) {
    if (!window.confirm("Delete this role and remove it from assigned users?")) return;

    try {
      await deleteRole(roleId);
      toast.success("Role deleted");
      if (roleForm.id === roleId) setRoleForm(emptyRoleForm);
      await loadAdminData();
    } catch (error) {
      toast.error((error as Error).message);
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
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            Only administrators can manage roles and users.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Access Control</h1>
          <p className="text-slate-500">Manage roles, permissions, and user assignments.</p>
        </div>
        <Button variant="outline" onClick={() => void loadAdminData()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Builder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleRoleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role-name">Role name</Label>
                  <Input
                    id="role-name"
                    value={roleForm.name}
                    onChange={(event) =>
                      setRoleForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Content Editor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-description">Description</Label>
                  <Input
                    id="role-description"
                    value={roleForm.description}
                    onChange={(event) =>
                      setRoleForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Can manage blog content"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {resources.map((resource) => (
                  <div key={getId(resource)} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold">{resource.name}</h3>
                      <span className="text-xs text-slate-500">{getId(resource)}</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {resource.actions.map((action) => {
                        const id = `${getId(resource)}-${action}`;
                        return (
                          <Label key={id} htmlFor={id} className="flex items-center gap-2 text-sm">
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

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={savingRole}>
                  {savingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {roleForm.id ? "Update Role" : "Create Role"}
                </Button>
                {roleForm.id && (
                  <Button type="button" variant="outline" onClick={() => setRoleForm(emptyRoleForm)}>
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Existing Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roles.map((role) => (
                  <div key={getId(role)} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold">{role.name}</h3>
                        <p className="text-sm text-slate-500">{role.description || "No description"}</p>
                        <p className="mt-1 text-xs text-slate-400">{getId(role)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setRoleForm({
                              id: getId(role),
                              name: role.name,
                              description: role.description ?? "",
                              permissions: role.permissions ?? [],
                            })
                          }
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void handleDeleteRole(getId(role))}
                          disabled={getId(role) === "role_admin"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(role.permissions ?? []).map((permission) => (
                        <span
                          key={`${getId(role)}-${permission.resource}`}
                          className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
                        >
                          {permission.resource}: {permission.actions.join(", ")}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Create User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={handleUserSubmit}>
                <Input
                  value={userForm.name}
                  onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Name"
                />
                <Input
                  type="email"
                  value={userForm.email}
                  onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="Email"
                />
                <Input
                  type="password"
                  value={userForm.password}
                  onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Password"
                />
                <Button type="submit" disabled={savingUser}>
                  {savingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Role Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={getId(user)} className="rounded-lg border p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => void viewPermissions(getId(user))}>
                    View Permissions
                  </Button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {roles.map((role) => {
                    const checkboxId = `${getId(user)}-${getId(role)}`;
                    return (
                      <Label key={checkboxId} htmlFor={checkboxId} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          id={checkboxId}
                          checked={(user.roleIds ?? []).includes(getId(role))}
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

      {selectedProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Effective Permissions: {selectedProfile.user.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {selectedProfile.permissions.map((permission) => (
                <div key={permission.resource} className="rounded-lg border p-3">
                  <p className="font-semibold">{permission.resource}</p>
                  <p className="mt-1 text-sm text-slate-500">{permission.actions.join(", ")}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Footer />
    </div>
  );
}
