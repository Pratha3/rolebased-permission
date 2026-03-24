"use client";

import Footer from "@/components/common/footer";
import { ProtectedPage } from "@/components/permission/protectedPage";
import { ProtectedSection } from "@/components/permission/protectedSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Clock,
  MessageSquare,
  Send
} from "lucide-react";

export default function InquiriesPage() {
  return (
    <ProtectedPage resource="inquiries" action="view">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Customer Inquiries</h1>
          <p className="text-slate-500 mt-1">
            Manage and respond to customer inquiries
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Inquiries
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Closed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Product Demo Request</h3>
                    <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                      open
                    </span>
                    <span className="text-xs font-medium text-red-600">
                      high priority
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    <p>From: Alice Johnson (alice@example.com)</p>
                    <p className="mt-1">Date: 2024-03-15</p>
                  </div>
                </div>

              </div>

              <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Billing Question</h3>
                    <span className="px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-700">
                      in-progress
                    </span>
                    <span className="text-xs font-medium text-orange-600">
                      medium priority
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    <p>From: Bob Smith (bob@example.com)</p>
                    <p className="mt-1">Date: 2024-03-14</p>
                    <p className="mt-1">Assigned to: John Doe</p>
                  </div>
                </div>

              </div>

              <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Feature Request</h3>
                    <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                      closed
                    </span>
                    <span className="text-xs font-medium text-green-600">
                      low priority
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    <p>From: Carol White (carol@example.com)</p>
                    <p className="mt-1">Date: 2024-03-10</p>
                    <p className="mt-1">Assigned to: Jane Smith</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ProtectedSection resource="inquiries" action="respond">
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4" />
                      Respond
                    </Button>
                  </ProtectedSection>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Footer />
      </div>
    </ProtectedPage>
  );
}
