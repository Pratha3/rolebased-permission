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

export default function AnalyticsPage() {
  return (
    <ProtectedPage resource="analytics" action="view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-slate-500 mt-1">
              Track your website performance and user behavior
            </p>
          </div>

          <ProtectedSection resource="analytics" action="export">
            <Button>
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </ProtectedSection>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Visitors
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45,231</div>
              <p className="text-xs text-green-600 mt-1">+12.5%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">123,456</div>
              <p className="text-xs text-green-600 mt-1">+8.2%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              <MousePointer className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.24%</div>
              <p className="text-xs text-green-600 mt-1">+0.5%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Conversion Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4%</div>
              <p className="text-xs text-green-600 mt-1">+1.2%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">/dashboard</p>
                    <p className="text-sm text-slate-500">
                      12,543 views • 8,234 unique
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `100%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">/blogs</p>
                    <p className="text-sm text-slate-500">
                      9,876 views • 6,543 unique
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `70%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">/products</p>
                    <p className="text-sm text-slate-500">
                      7,654 views • 5,432 unique
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `50%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    4
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">/about</p>
                    <p className="text-sm text-slate-500">
                      5,432 views • 3,456 unique
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `40%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    5
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">/contact</p>
                    <p className="text-sm text-slate-500">
                      3,210 views • 2,345 unique
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `25%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Direct</span>
                    <span className="text-sm text-slate-500">
                      15,234 visitors
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-purple-500"
                        style={{ width: `33.7%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      33.7%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Organic Search</span>
                    <span className="text-sm text-slate-500">
                      12,456 visitors
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-purple-500"
                        style={{ width: `27.5%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      27.5%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Social Media</span>
                    <span className="text-sm text-slate-500">
                      9,876 visitors
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-purple-500"
                        style={{ width: `21.8%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      21.8%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Referral</span>
                    <span className="text-sm text-slate-500">
                      5,432 visitors
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-purple-500"
                        style={{ width: `12%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      12.0%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Email</span>
                    <span className="text-sm text-slate-500">
                      2,233 visitors
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-purple-500"
                        style={{ width: `5%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      5.0%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <ProtectedSection
          resource="analytics"
          action="export"
          fallback={
            <Card>
              <CardContent className="py-8 text-center text-slate-500">
                <p>Advanced analytics require export permissions</p>
              </CardContent>
            </Card>
          }
        >
          <Card>
            <CardHeader>
              <CardTitle>Advanced Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-slate-500">
                    Avg. Session Duration
                  </p>
                  <p className="text-2xl font-bold mt-1">4m 32s</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-slate-500">Bounce Rate</p>
                  <p className="text-2xl font-bold mt-1">42.3%</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-slate-500">Pages per Session</p>
                  <p className="text-2xl font-bold mt-1">3.8</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ProtectedSection>

        <Footer />
      </div>
    </ProtectedPage>
  );
}
