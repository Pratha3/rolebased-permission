"use client";

import Footer from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, Shield, TrendingUp, Users } from "lucide-react";

export default function DashboardPage() {
  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group relative overflow-hidden border-slate-900 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-500/10">
            <div
              className={`absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 opacity-10 blur-2xl transition-all group-hover:scale-150`}
            />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Users
              </CardTitle>
              <div className={`rounded-xl bg-blue-50 p-2.5`}>
                <Users className={`h-5 w-5 text-blue-600`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2,543</div>
              <div className="mt-1 flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">+12.5%</span>
                <span className="text-slate-500">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-slate-900 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-500/10">
            <div
              className={`absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-linear-to-br from-purple-500 to-pink-500 opacity-10 blur-2xl transition-all group-hover:scale-150`}
            />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Active Roles
              </CardTitle>
              <div className={`rounded-xl bg-purple-50 p-2.5`}>
                <Shield className={`h-5 w-5 text-purple-600`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">8</div>
              <div className="mt-1 flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">+2 new</span>
                <span className="text-slate-500">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-slate-900 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-500/10">
            <div
              className={`absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-linear-to-br from-green-500 to-emerald-500 opacity-10 blur-2xl transition-all group-hover:scale-150`}
            />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Blog Posts
              </CardTitle>
              <div className={`rounded-xl bg-green-50 p-2.5`}>
                <FileText className={`h-5 w-5 text-green-600`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">156</div>
              <div className="mt-1 flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">+23%</span>
                <span className="text-slate-500">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-slate-900 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-500/10">
            <div
              className={`absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-linear-to-br from-orange-500 to-red-500 opacity-10 blur-2xl transition-all group-hover:scale-150`}
            />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Active Sessions
              </CardTitle>
              <div className={`rounded-xl bg-orange-50 p-2.5`}>
                <Activity className={`h-5 w-5 text-orange-600`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,234</div>
              <div className="mt-1 flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">+8.2%</span>
                <span className="text-slate-500">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-900 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <p className="text-sm text-slate-500">
                  Latest actions in your system
                </p>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-slate-800 p-4 transition-all hover:border-blue-900 hover:bg-blue-50/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600 text-lg font-bold text-white shadow-lg">
                  A
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">Alice Admin</span> created
                    new role{" "}
                    <span className="font-semibold text-blue-600">
                      Content Editor
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">2 hours ago</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-blue-600"
                >
                  View
                </Button>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-slate-800 p-4 transition-all hover:border-blue-900 hover:bg-blue-50/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-purple-600 text-lg font-bold text-white shadow-lg">
                  B
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">Bob Manager</span> updated
                    permissions for{" "}
                    <span className="font-semibold text-blue-600">
                      Marketing Team
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">4 hours ago</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-blue-600"
                >
                  View
                </Button>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-slate-800 p-4 transition-all hover:border-blue-900 hover:bg-blue-50/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-red-500 to-red-600 text-lg font-bold text-white shadow-lg">
                  C
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">Charlie Dev</span> deleted
                    role{" "}
                    <span className="font-semibold text-blue-600">
                      Temp Access
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">1 day ago</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-blue-600"
                >
                  View
                </Button>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-slate-800 p-4 transition-all hover:border-blue-900 hover:bg-blue-50/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-green-500 to-green-600 text-lg font-bold text-white shadow-lg">
                  D
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">Diana Lead</span> added 3
                    new users to{" "}
                    <span className="font-semibold text-blue-600">
                      Sales Department
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">2 days ago</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-blue-600"
                >
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Footer />
      </div>
    </>
  );
}
