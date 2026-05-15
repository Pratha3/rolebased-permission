"use client";

import Footer from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useIsAdmin,
  useIsMarketing,
  useIsSales,
  useIsViewer,
} from "@/hooks/usePermission";
import { useAuthStore } from "@/store/userStore";
import {
  Activity,
  ArrowUpRight,
  FileText,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const statCards = [
  {
    title: "Total Users",
    value: "2,543",
    change: "+12.5%",
    icon: Users,
    gradient: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-600",
    glowColor: "hover:shadow-blue-500/10",
  },
  {
    title: "Active Roles",
    value: "8",
    change: "+2 new",
    icon: Shield,
    gradient: "from-purple-500 to-pink-500",
    iconBg: "bg-purple-50 dark:bg-purple-500/10",
    iconColor: "text-purple-600",
    glowColor: "hover:shadow-purple-500/10",
  },
  {
    title: "Blog Posts",
    value: "156",
    change: "+23%",
    icon: FileText,
    gradient: "from-emerald-500 to-teal-500",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-600",
    glowColor: "hover:shadow-emerald-500/10",
  },
  {
    title: "Active Sessions",
    value: "1,234",
    change: "+8.2%",
    icon: Activity,
    gradient: "from-orange-500 to-red-500",
    iconBg: "bg-orange-50 dark:bg-orange-500/10",
    iconColor: "text-orange-600",
    glowColor: "hover:shadow-orange-500/10",
  },
];

const recentActivity = [
  {
    initial: "A",
    gradient: "from-blue-500 to-blue-600",
    name: "Alice Admin",
    action: "created new role",
    subject: "Content Editor",
    time: "2 hours ago",
  },
  {
    initial: "B",
    gradient: "from-purple-500 to-purple-600",
    name: "Bob Manager",
    action: "updated permissions for",
    subject: "Marketing Team",
    time: "4 hours ago",
  },
  {
    initial: "C",
    gradient: "from-red-500 to-red-600",
    name: "Charlie Dev",
    action: "deleted role",
    subject: "Temp Access",
    time: "1 day ago",
  },
  {
    initial: "D",
    gradient: "from-emerald-500 to-emerald-600",
    name: "Diana Lead",
    action: "added 3 new users to",
    subject: "Sales Department",
    time: "2 days ago",
  },
];

function RoleGreeting() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = useIsAdmin();
  const isMarketing = useIsMarketing();
  const isSales = useIsSales();
  const isViewer = useIsViewer();

  const firstName = user?.name?.split(" ")[0] ?? "there";

  if (isAdmin)
    return (
      <div className="flex items-center gap-2 mt-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-600">
          <Sparkles className="h-3 w-3" />
          Admin — Full access
        </span>
      </div>
    );
  if (isMarketing)
    return (
      <div className="flex items-center gap-2 mt-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-600">
          <FileText className="h-3 w-3" />
          Marketing — Blog & analytics access
        </span>
      </div>
    );
  if (isSales)
    return (
      <div className="flex items-center gap-2 mt-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-600">
          <Activity className="h-3 w-3" />
          Sales — Inquiry & analytics access
        </span>
      </div>
    );
  if (isViewer)
    return (
      <div className="flex items-center gap-2 mt-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 border border-slate-500/20 px-3 py-1 text-xs font-semibold text-slate-600">
          Read-only access
        </span>
      </div>
    );

  return null;
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header with role greeting */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <RoleGreeting />
      </div>

      {/* Stat cards — staggered entrance */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className={`group relative overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 hover:shadow-xl ${card.glowColor} animate-fade-in-up`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Glow blob */}
              <div
                className={`absolute right-0 top-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-20`}
              />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {card.title}
                </CardTitle>
                <div className={`rounded-xl ${card.iconBg} p-2.5`}>
                  <Icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-white animate-fade-in animation-delay-300">
                  {card.value}
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span className="font-semibold">{card.change}</span>
                  <span className="text-slate-400">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent activity */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in-up animation-delay-400">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">
                Recent Activity
              </CardTitle>
              <p className="text-sm text-slate-500 mt-0.5">
                Latest actions across your system
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              View All
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div
                key={item.name + i}
                className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-800 p-4 transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 animate-slide-in-left"
                style={{ animationDelay: `${500 + i * 60}ms` }}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-sm font-bold text-white shadow`}
                >
                  {item.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    <span className="font-semibold">{item.name}</span>{" "}
                    {item.action}{" "}
                    <span className="font-semibold text-blue-600">
                      {item.subject}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-blue-600 shrink-0 text-xs"
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Footer />
    </div>
  );
}
