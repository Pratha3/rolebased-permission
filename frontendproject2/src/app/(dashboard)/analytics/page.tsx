"use client";

import Footer from "@/components/common/footer";
import { ProtectedPage } from "@/components/permission/protectedPage";
import { ProtectedSection } from "@/components/permission/protectedSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Download,
  Eye,
  MousePointer,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useRef } from "react";

const topPages = [
  { path: "/dashboard", views: 12543, unique: 8234, pct: 100 },
  { path: "/blogs", views: 9876, unique: 6543, pct: 70 },
  { path: "/products", views: 7654, unique: 5432, pct: 50 },
  { path: "/about", views: 5432, unique: 3456, pct: 40 },
  { path: "/contact", views: 3210, unique: 2345, pct: 25 },
];

const trafficSources = [
  { label: "Direct", visitors: 15234, pct: 33.7 },
  { label: "Organic Search", visitors: 12456, pct: 27.5 },
  { label: "Social Media", visitors: 9876, pct: 21.8 },
  { label: "Referral", visitors: 5432, pct: 12.0 },
  { label: "Email", visitors: 2233, pct: 5.0 },
];

const statCards = [
  { title: "Total Visitors", value: "45,231", change: "+12.5%", icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { title: "Page Views", value: "123,456", change: "+8.2%", icon: Eye, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { title: "Click Rate", value: "3.24%", change: "+0.5%", icon: MousePointer, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
  { title: "Conversion Rate", value: "2.4%", change: "+1.2%", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
];

function AnimatedBar({ pct, delay = 0 }: { pct: number; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const timer = setTimeout(() => {
      el.style.width = `${pct}%`;
    }, delay);
    return () => clearTimeout(timer);
  }, [pct, delay]);

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <div
        ref={ref}
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
        style={{ width: "0%" }}
      />
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedPage resource="analytics" action="view">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track website performance and user behavior.
            </p>
          </div>
          <ProtectedSection resource="analytics" action="export">
            <Button size="sm" className="gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-md shadow-blue-500/20">
              <Download className="h-3.5 w-3.5" />
              Export Report
            </Button>
          </ProtectedSection>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-slate-500">{card.title}</CardTitle>
                  <div className={`rounded-lg ${card.bg} p-2`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                  <p className="text-xs text-emerald-600 mt-1 font-medium">{card.change}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top pages */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in-up animation-delay-300">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                Top Pages
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {topPages.map((page, i) => (
                <div key={page.path} className="space-y-2 animate-fade-in" style={{ animationDelay: `${400 + i * 60}ms` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-[10px] font-bold text-blue-600">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 font-mono">
                        {page.path}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{page.views.toLocaleString()} views</span>
                  </div>
                  <AnimatedBar pct={page.pct} delay={500 + i * 80} />
                  <p className="text-xs text-slate-400">{page.unique.toLocaleString()} unique visitors</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Traffic sources */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in-up animation-delay-400">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">
              {trafficSources.map((source, i) => (
                <div key={source.label} className="space-y-2 animate-fade-in" style={{ animationDelay: `${400 + i * 60}ms` }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{source.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{source.visitors.toLocaleString()}</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 w-10 text-right">
                        {source.pct}%
                      </span>
                    </div>
                  </div>
                  <AnimatedBar pct={source.pct} delay={500 + i * 80} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Advanced metrics (export-gated) */}
        <ProtectedSection
          resource="analytics"
          action="export"
          fallback={
            <Card className="border-dashed border-slate-200 dark:border-slate-800">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <Download className="h-8 w-8 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">Advanced metrics locked</p>
                <p className="text-xs text-slate-400 mt-1">
                  Requires <strong>analytics:export</strong> permission
                </p>
              </CardContent>
            </Card>
          }
        >
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in-up animation-delay-500">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base">Advanced Metrics</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: "Avg. Session Duration", value: "4m 32s" },
                  { label: "Bounce Rate", value: "42.3%" },
                  { label: "Pages per Session", value: "3.8" },
                ].map((metric, i) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center animate-scale-in"
                    style={{ animationDelay: `${600 + i * 60}ms` }}
                  >
                    <p className="text-xs text-slate-500 mb-1">{metric.label}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ProtectedSection>

        <Footer />
      </div>
    </ProtectedPage>
  );
}
