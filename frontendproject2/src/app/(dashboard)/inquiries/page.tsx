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
  RefreshCw,
  Send,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type FilterTab = "all" | "open" | "in-progress" | "closed";

const priorityConfig = {
  high: {
    border: "border-l-red-500",
    badge: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800",
    dot: "bg-red-500",
    label: "High",
  },
  medium: {
    border: "border-l-orange-400",
    badge: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800",
    dot: "bg-orange-400",
    label: "Medium",
  },
  low: {
    border: "border-l-emerald-400",
    badge: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
    dot: "bg-emerald-400",
    label: "Low",
  },
};

const statusConfig = {
  open: {
    badge: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
    dot: "bg-blue-500",
    label: "Open",
  },
  "in-progress": {
    badge: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800",
    dot: "bg-orange-400",
    label: "In Progress",
  },
  closed: {
    badge: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700",
    dot: "bg-slate-400",
    label: "Closed",
  },
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const stats = useMemo(() => ({
    total: inquiries.length,
    open: inquiries.filter((i) => i.status === "open").length,
    progress: inquiries.filter((i) => i.status === "in-progress").length,
    closed: inquiries.filter((i) => i.status === "closed").length,
  }), [inquiries]);

  const filtered = useMemo(() => {
    let list = inquiries;
    if (activeTab !== "all") list = list.filter((i) => i.status === activeTab);
    if (search.trim())
      list = list.filter(
        (i) =>
          i.subject.toLowerCase().includes(search.toLowerCase()) ||
          i.customerName.toLowerCase().includes(search.toLowerCase()),
      );
    return list;
  }, [inquiries, activeTab, search]);

  useEffect(() => { void loadInquiries(); }, []);

  async function loadInquiries() {
    try {
      setIsLoading(true);
      const [inquiryList, userList] = await Promise.all([getInquiries(), getAssignableUsers()]);
      setInquiries(inquiryList);
      setUsers(userList);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  function updateInquiry(updated: Inquiry) {
    setInquiries((c) => c.map((i) => (i._id === updated._id ? updated : i)));
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
    if (!responseId || !responseText.trim()) { toast.error("Response is required"); return; }
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

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: stats.total },
    { key: "open", label: "Open", count: stats.open },
    { key: "in-progress", label: "In Progress", count: stats.progress },
    { key: "closed", label: "Closed", count: stats.closed },
  ];

  return (
    <ProtectedPage resource="inquiries" action="view">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Inquiries</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track who created, assigned, responded, and closed each inquiry.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadInquiries()}
            disabled={isLoading}
            className="gap-1.5 shrink-0"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total" value={stats.total} icon={<MessageSquare className="h-4 w-4 text-slate-400" />} delay={0} />
          <StatCard title="Open" value={stats.open} icon={<Clock className="h-4 w-4 text-blue-500" />} accent="text-blue-600" delay={80} />
          <StatCard title="In Progress" value={stats.progress} icon={<Clock className="h-4 w-4 text-orange-500" />} accent="text-orange-600" delay={160} />
          <StatCard title="Closed" value={stats.closed} icon={<CheckCircle className="h-4 w-4 text-emerald-500" />} accent="text-emerald-600" delay={240} />
        </div>

        {/* List card */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in-up animation-delay-300">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4">
              <CardTitle className="text-base">All Inquiries</CardTitle>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search inquiries…"
                className="h-9 w-full sm:w-56 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 overflow-x-auto pb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-t-lg px-3 py-2 text-xs font-semibold transition-all ${
                    activeTab === tab.key
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      activeTab === tab.key
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-600"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800 shimmer" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 py-14 text-center">
                <MessageSquare className="h-8 w-8 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">No inquiries found</p>
                <p className="text-xs text-slate-400 mt-1">
                  {search ? "Try a different search term" : "No inquiries match this filter"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((inquiry, i) => {
                  const pCfg = priorityConfig[inquiry.priority];
                  const sCfg = statusConfig[inquiry.status];
                  return (
                    <div
                      key={inquiry._id}
                      className={`relative rounded-xl border border-slate-200 dark:border-slate-700 border-l-4 ${pCfg.border} p-4 transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 animate-fade-in`}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        {/* Left content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                              {inquiry.subject}
                            </h3>
                            {/* Status badge */}
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${sCfg.badge}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${sCfg.dot}`} />
                              {sCfg.label}
                            </span>
                            {/* Priority badge */}
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${pCfg.badge}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${pCfg.dot}`} />
                              {pCfg.label} Priority
                            </span>
                          </div>

                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                            {inquiry.message}
                          </p>

                          <div className="grid gap-1.5 text-xs text-slate-500 md:grid-cols-2">
                            <InfoLine label="From" value={`${inquiry.customerName} (${inquiry.customerEmail})`} />
                            <InfoLine label="Created" value={formatDateTime(inquiry.createdAt)} />
                            <InfoLine label="Assigned to" value={inquiry.assignedToName || "Not assigned"} />
                            <InfoLine
                              label="Responded by"
                              value={
                                inquiry.respondedByName
                                  ? `${inquiry.respondedByName} · ${formatDateTime(inquiry.respondedAt)}`
                                  : "No response yet"
                              }
                            />
                            {inquiry.closedByName && (
                              <InfoLine
                                label="Closed by"
                                value={`${inquiry.closedByName} · ${formatDateTime(inquiry.closedAt)}`}
                              />
                            )}
                          </div>

                          {inquiry.response && (
                            <div className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-sm">
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Latest Response
                              </p>
                              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                                {inquiry.response}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Right actions */}
                        <div className="flex flex-col gap-2 lg:w-56 lg:shrink-0">
                          <ProtectedSection resource="inquiries" action="assign">
                            <select
                              className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all disabled:opacity-50"
                              value={inquiry.assignedToId ?? ""}
                              onChange={(e) => void handleAssign(inquiry._id, e.target.value)}
                              disabled={busyId === inquiry._id || inquiry.status === "closed"}
                            >
                              <option value="">Assign to…</option>
                              {users.map((u) => (
                                <option key={u._id} value={u._id}>{u.name}</option>
                              ))}
                            </select>
                          </ProtectedSection>

                          <div className="flex gap-2">
                            <ProtectedSection resource="inquiries" action="respond">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startRespond(inquiry)}
                                disabled={inquiry.status === "closed"}
                                className="flex-1 gap-1.5 text-xs h-8"
                              >
                                <Send className="h-3.5 w-3.5" />
                                Respond
                              </Button>
                            </ProtectedSection>

                            <ProtectedSection resource="inquiries" action="close">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => void handleClose(inquiry._id)}
                                disabled={busyId === inquiry._id || inquiry.status === "closed"}
                                className="flex-1 gap-1.5 text-xs h-8 text-red-500 hover:text-red-600 hover:border-red-200"
                              >
                                {busyId === inquiry._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5" />
                                )}
                                Close
                              </Button>
                            </ProtectedSection>
                          </div>
                        </div>
                      </div>

                      {/* Response inline form */}
                      {responseId === inquiry._id && (
                        <form
                          className="mt-4 space-y-3 border-t border-slate-200 dark:border-slate-700 pt-4 animate-fade-in"
                          onSubmit={handleRespond}
                        >
                          <Textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Write your response to the customer…"
                            rows={4}
                            className="resize-none"
                          />
                          <div className="flex gap-2">
                            <Button type="submit" disabled={busyId === inquiry._id} className="gap-1.5 text-xs h-8">
                              {busyId === inquiry._id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <UserCheck className="h-3.5 w-3.5" />
                              )}
                              Save Response
                            </Button>
                            <Button type="button" variant="outline" onClick={cancelRespond} className="gap-1.5 text-xs h-8">
                              <X className="h-3.5 w-3.5" />
                              Cancel
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
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
  accent = "text-slate-700",
  delay = 0,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  accent?: string;
  delay?: number;
}) {
  return (
    <Card
      className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-slate-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex gap-1">
      <span className="font-medium text-slate-600 dark:text-slate-400 shrink-0">{label}:</span>
      <span className="text-slate-500 truncate">{value}</span>
    </p>
  );
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
