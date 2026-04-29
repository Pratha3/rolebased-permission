"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/userStore";
import { usePermission } from "@/hooks/usePermission";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Map routes to required permissions - only resources that exist in backend
const routePermissions: Record<string, { resource: string; action: string }> = {
    "/blogs": { resource: "blogs", action: "view" },
    "/analytics": { resource: "analytics", action: "view" },
    "/inquiries": { resource: "inquiries", action: "view" },
};

export function PermissionWatcher() {
    const pathname = usePathname();
    const router = useRouter();
    const [showAccessDenied, setShowAccessDenied] = useState(false);
    const [deniedRoute, setDeniedRoute] = useState("");
    const lastPermissionUpdate = useAuthStore((s) => s.lastPermissionUpdate);

    // Get required permission for current route
    const routeConfig = routePermissions[pathname];
    const hasAccess = usePermission(
        routeConfig?.resource || "dashboard",
        routeConfig?.action || "view"
    );

    useEffect(() => {
        // Skip check if no route config or if this is the first load
        if (!routeConfig || lastPermissionUpdate === 0) return;

        // Check if user lost access to current page
        if (!hasAccess) {
            console.log("permission watcher: user lost access to", pathname);
            setDeniedRoute(pathname);
            setShowAccessDenied(true);
        }
    }, [lastPermissionUpdate, hasAccess, pathname, routeConfig]);

    const handleRedirect = () => {
        setShowAccessDenied(false);
        router.push("/dashboard");
    };

    return (
        <AlertDialog open={showAccessDenied} onOpenChange={setShowAccessDenied}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Access Removed</AlertDialogTitle>
                    <AlertDialogDescription>
                        Your permissions have been updated by an administrator. You no
                        longer have access to this page: <strong>{deniedRoute}</strong>
                        <br />
                        <br />
                        You will be redirected to the dashboard.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={handleRedirect}>
                        Go to Dashboard
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
