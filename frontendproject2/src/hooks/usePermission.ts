//useMemo avoid maultiple re-render

import { useMemo } from "react";
import { useAuthStore } from "@/store/userStore";

export type Permission = { resource: string; actions: string[] };
//helper to allow case-insensitive 
const norm = (s?: string) => (s || "").toLowerCase();

function usePermissionState() {
  // Select both permissions and timestamp - Zustand will handle shallow comparison automatically
  const perms = useAuthStore((s) => s.permissions as Permission[]);
  const lastUpdate = useAuthStore((s) => s.lastPermissionUpdate);

  //if permission change or timestamp changes, useMemo will re-render
  return useMemo(() => {
    //using map fast lookup for whether an action exsits for resource and avoids duplicate via set
    const map = new Map<string, Set<string>>();
    //user has resource "*" then globalAll becomes true and user have full access.
    const globalAll = perms?.some(p =>
      norm(p.resource) === "*" && p.actions.some(a => ["*", "manage"].includes(norm(a)))
    );

    perms?.forEach(p => {
      const r = norm(p.resource);
      const set = map.get(r) || new Set();
      //normalize each action and add to the Set.
      p.actions?.forEach(a => set.add(norm(a)));
      //store set on that map for that resource
      map.set(r, set);
    });

    return { map, globalAll };
  }, [perms, lastUpdate]);
}

/** Permission Hooks */
export function usePermission(resource: string, action: string): boolean {
  const { map, globalAll } = usePermissionState();
  const set = map.get(norm(resource));
  return globalAll || !!(set?.has("*") || set?.has("manage") || set?.has(norm(action)));
}
//return list of acions allowed on a resource
export function useResourcePermissions(resource: string): string[] {
  const { map, globalAll } = usePermissionState();
  //if global is exsited otherwise convert set into Array or empty
  return globalAll ? ["*"] : Array.from(map.get(norm(resource)) || []);
}

export function useHasAnyPermission(resource: string): boolean {
  const { map, globalAll } = usePermissionState();
  //check set size
  return globalAll || (map.get(norm(resource))?.size ?? 0) > 0;
}

export function useAccessibleResources(): string[] {
  const { map, globalAll } = usePermissionState();
  //filter out empty keys from map and return to ui
  return globalAll ? ["*"] : Array.from(map.keys()).filter(Boolean);
}

/** Role Hooks */
import { getId } from "@/types/auth";
export const useHasRole = (id: string) => useAuthStore(s => s.roles.some(r => getId(r) === id));
export const useIsAdmin = () => useHasRole("role_admin");
export const useIsMarketing = () => useHasRole("role_marketing");
export const useIsSales = () => useHasRole("role_sales");
export const useIsViewer = () => useHasRole("role_viewer");

/** Convenience */
export const useCanAccessPage = (resource: string) => usePermission(resource, "view");
