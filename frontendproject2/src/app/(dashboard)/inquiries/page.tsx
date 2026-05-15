"use client";

import Footer from "@/components/common/footer";
import { ProtectedPage } from "@/components/permission/protectedPage";
import { ProtectedSection } from "@/components/permission/protectedSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  assignInquiry,
  closeInquiry,
  getAssignableUsers,
  getInquiries,
  Inquiry,
  respondToInquiry,
} from "@/services/inquiries";
import { User } from "@/types/auth";
import {
  CheckCircle,
  Clock,
  Loader2,
  MessageSquare,
  Send,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const stats = useMemo(() => {
    return {
      total: inquiries.length,
      open: inquiries.filter((inquiry) => inquiry.status === "open").length,
      progress: inquiries.filter((inquiry) => inquiry.status === "in-progress").length,
      closed: inquiries.filter((inquiry) => inquiry.status === "closed").length,
    };
  }, [inquiries]);

  useEffect(() => {
    void loadInquiries();
  }, []);

  async function loadInquiries() {
    try {
      setIsLoading(true);
      const [inquiryList, userList] = await Promise.all([
        getInquiries(),
        getAssignableUsers(),
      ]);
      setInquiries(inquiryList);
      setUsers(userList);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  function updateInquiry(updated: Inquiry) {
    setInquiries((current) =>
      current.map((inquiry) => (inquiry._id === updated._id ? updated : inquiry)),
    );
  }

  async function handleAssign(inquiryId: string, userId: string) {
    if (!userId) return;
    try {
      setBusyId(inquiryId);
      updateInquiry(await assignInquiry(inquiryId, userId));
      toast.success("Inquiry assigned");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  function startRespond(inquiry: Inquiry) {
    setResponseId(inquiry._id);
    setResponseText(inquiry.response ?? "");
  }

  function cancelRespond() {
    setResponseId(null);
    setResponseText("");
  }

  async function handleRespond(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!responseId || !responseText.trim()) {
      toast.error("Response is required");
      return;
    }

    try {
      setBusyId(responseId);
      updateInquiry(await respondToInquiry(responseId, responseText.trim()));
      toast.success("Response saved");
      cancelRespond();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleClose(inquiryId: string) {
    try {
      setBusyId(inquiryId);
      updateInquiry(await closeInquiry(inquiryId));
      toast.success("Inquiry closed");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ProtectedPage resource="inquiries" action="view">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customer Inquiries</h1>
            <p className="mt-1 text-slate-500">
              Track who created, who is assigned, who responded, and who closed each inquiry.
            </p>
          </div>
          <Button variant="outline" onClick={() => void loadInquiries()} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Inquiries" value={stats.total} icon={<MessageSquare className="h-4 w-4 text-slate-500" />} />
          <StatCard title="Open" value={stats.open} icon={<Clock className="h-4 w-4 text-blue-500" />} />
          <StatCard title="In Progress" value={stats.progress} icon={<Clock className="h-4 w-4 text-orange-500" />} />
          <StatCard title="Closed" value={stats.closed} icon={<CheckCircle className="h-4 w-4 text-green-500" />} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading inquiries
              </div>
            ) : inquiries.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-slate-500">
                No inquiries available.
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <div
                    key={inquiry._id}
                    className="rounded-lg border p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{inquiry.subject}</h3>
                          <StatusBadge status={inquiry.status} />
                          <PriorityBadge priority={inquiry.priority} />
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{inquiry.message}</p>

                        <div className="mt-3 grid gap-2 text-sm text-slate-500 md:grid-cols-2">
                          <InfoLine
                            label="Created by"
                            value={`${inquiry.customerName} (${inquiry.customerEmail})`}
                          />
                          <InfoLine label="Created on" value={formatDateTime(inquiry.createdAt)} />
                          <InfoLine
                            label="Assigned to"
                            value={inquiry.assignedToName || "Not assigned"}
                          />
                          <InfoLine
                            label="Responded by"
                            value={
                              inquiry.respondedByName
                                ? `${inquiry.respondedByName} on ${formatDateTime(inquiry.respondedAt)}`
                                : "No response yet"
                            }
                          />
                          {inquiry.closedByName && (
                            <InfoLine
                              label="Closed by"
                              value={`${inquiry.closedByName} on ${formatDateTime(inquiry.closedAt)}`}
                            />
                          )}
                        </div>

                        {inquiry.response && (
                          <div className="mt-3 rounded-md bg-slate-100 p-3 text-sm text-slate-700">
                            <p className="font-medium text-slate-900">Latest response</p>
                            <p className="mt-1">{inquiry.response}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 lg:w-64">
                        <ProtectedSection resource="inquiries" action="assign">
                          <div className="relative">
                            <select
                              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                              value={inquiry.assignedToId ?? ""}
                              onChange={(event) =>
                                void handleAssign(inquiry._id, event.target.value)
                              }
                              disabled={busyId === inquiry._id || inquiry.status === "closed"}
                              aria-label={`Assign ${inquiry.subject}`}
                            >
                              <option value="">Assign to user</option>
                              {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                  {user.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </ProtectedSection>

                        <div className="flex flex-wrap gap-2">
                          <ProtectedSection resource="inquiries" action="respond">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startRespond(inquiry)}
                              disabled={inquiry.status === "closed"}
                            >
                              <Send className="h-4 w-4" />
                              Respond
                            </Button>
                          </ProtectedSection>

                          <ProtectedSection resource="inquiries" action="close">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => void handleClose(inquiry._id)}
                              disabled={busyId === inquiry._id || inquiry.status === "closed"}
                            >
                              {busyId === inquiry._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                              Close
                            </Button>
                          </ProtectedSection>
                        </div>
                      </div>
                    </div>

                    {responseId === inquiry._id && (
                      <form className="mt-4 space-y-3 border-t pt-4" onSubmit={handleRespond}>
                        <Textarea
                          value={responseText}
                          onChange={(event) => setResponseText(event.target.value)}
                          placeholder="Write the customer response"
                          rows={4}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button type="submit" disabled={busyId === inquiry._id}>
                            {busyId === inquiry._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                            Save Response
                          </Button>
                          <Button type="button" variant="outline" onClick={cancelRespond}>
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Footer />
      </div>
    </ProtectedPage>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-medium text-slate-700">{label}:</span> {value}
    </p>
  );
}

function StatusBadge({ status }: { status: Inquiry["status"] }) {
  const classes = {
    open: "bg-blue-100 text-blue-700",
    "in-progress": "bg-orange-100 text-orange-700",
    closed: "bg-green-100 text-green-700",
  };

  return <span className={`rounded px-2 py-0.5 text-xs ${classes[status]}`}>{status}</span>;
}

function PriorityBadge({ priority }: { priority: Inquiry["priority"] }) {
  const classes = {
    high: "text-red-600",
    medium: "text-orange-600",
    low: "text-green-600",
  };

  return <span className={`text-xs font-medium ${classes[priority]}`}>{priority} priority</span>;
}

function formatDateTime(value?: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
