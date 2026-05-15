"use client";

import Footer from "@/components/common/footer";
import { ProtectedPage } from "@/components/permission/protectedPage";
import { ProtectedSection } from "@/components/permission/protectedSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  archiveBlog,
  BlogPayload,
  BlogPost,
  createBlog,
  getBlogs,
  publishBlog,
  updateBlog,
} from "@/services/blogs";
import {
  Archive,
  Check,
  Edit,
  Eye,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  TrendingUp,
  X,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type FilterTab = "all" | "published" | "draft" | "archived";

const emptyForm: BlogPayload = { title: "", excerpt: "", content: "" };

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<BlogPayload>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const stats = useMemo(() => ({
    total: blogs.length,
    published: blogs.filter((b) => b.status === "published").length,
    drafts: blogs.filter((b) => b.status === "draft").length,
    views: blogs.reduce((s, b) => s + (b.views || 0), 0),
  }), [blogs]);

  const filtered = useMemo(() => {
    let list = blogs;
    if (activeTab !== "all") list = list.filter((b) => b.status === activeTab);
    if (search.trim())
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.excerpt?.toLowerCase().includes(search.toLowerCase()),
      );
    return list;
  }, [blogs, activeTab, search]);

  useEffect(() => { void loadBlogs(); }, []);

  async function loadBlogs() {
    try {
      setIsLoading(true);
      setBlogs(await getBlogs());
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startEdit(blog: BlogPost) {
    setEditingId(blog._id);
    setForm({ title: blog.title, excerpt: blog.excerpt, content: blog.content });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    try {
      setIsSaving(true);
      if (editingId) {
        const updated = await updateBlog(editingId, normalizeForm(form));
        setBlogs((c) => c.map((b) => (b._id === editingId ? updated : b)));
        toast.success("Blog post updated");
      } else {
        const created = await createBlog(normalizeForm(form));
        setBlogs((c) => [created, ...c]);
        toast.success("Blog post created as draft");
      }
      closeForm();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish(blogId: string) {
    try {
      setBusyId(blogId);
      const updated = await publishBlog(blogId);
      setBlogs((c) => c.map((b) => (b._id === blogId ? updated : b)));
      toast.success("Blog post published");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleArchive(blogId: string) {
    try {
      setBusyId(blogId);
      const updated = await archiveBlog(blogId);
      setBlogs((c) => c.map((b) => (b._id === blogId ? updated : b)));
      toast.success("Blog post archived");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: stats.total },
    { key: "published", label: "Published", count: stats.published },
    { key: "draft", label: "Drafts", count: stats.drafts },
    { key: "archived", label: "Archived", count: blogs.filter((b) => b.status === "archived").length },
  ];

  return (
    <ProtectedPage resource="blogs" action="view">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Blog Posts</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage drafts, publishing, and archived content.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadBlogs()}
              disabled={isLoading}
              className="gap-1.5"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Refresh
            </Button>
            <ProtectedSection resource="blogs" action="create">
              <Button size="sm" onClick={startCreate} className="gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md shadow-blue-500/20 border-0">
                <Plus className="h-3.5 w-3.5" />
                Create Post
              </Button>
            </ProtectedSection>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Posts" value={stats.total} icon={<FileText className="h-4 w-4 text-slate-400" />} delay={0} />
          <StatCard title="Published" value={stats.published} icon={<Eye className="h-4 w-4 text-emerald-500" />} accent="text-emerald-600" delay={80} />
          <StatCard title="Drafts" value={stats.drafts} icon={<Edit className="h-4 w-4 text-orange-500" />} accent="text-orange-600" delay={160} />
          <StatCard title="Total Views" value={stats.views.toLocaleString()} icon={<TrendingUp className="h-4 w-4 text-blue-500" />} accent="text-blue-600" delay={240} />
        </div>

        {/* Create / Edit form */}
        {showForm && (
          <Card className="border-blue-200 dark:border-blue-900 shadow-lg shadow-blue-500/5 animate-scale-in">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {editingId ? "Edit Blog Post" : "Create New Blog Post"}
                </CardTitle>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="blog-title" className="text-sm font-medium">Title <span className="text-red-500">*</span></Label>
                    <Input
                      id="blog-title"
                      value={form.title}
                      onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
                      placeholder="Write a clear post title"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="blog-excerpt" className="text-sm font-medium">Excerpt</Label>
                    <Input
                      id="blog-excerpt"
                      value={form.excerpt}
                      onChange={(e) => setForm((c) => ({ ...c, excerpt: e.target.value }))}
                      placeholder="Short summary shown in listings"
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="blog-content" className="text-sm font-medium">Content</Label>
                  <Textarea
                    id="blog-content"
                    value={form.content}
                    onChange={(e) => setForm((c) => ({ ...c, content: e.target.value }))}
                    placeholder="Write the post content…"
                    rows={7}
                    className="resize-none"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button type="submit" disabled={isSaving} className="gap-1.5">
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {editingId ? "Save Changes" : "Create Draft"}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeForm} className="gap-1.5">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Blog list card */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in-up animation-delay-300">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4">
              <CardTitle className="text-base">All Blog Posts</CardTitle>
              {/* Search */}
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts…"
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
                  <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 shimmer" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 py-14 text-center">
                <FileText className="h-8 w-8 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">No posts found</p>
                <p className="text-xs text-slate-400 mt-1">
                  {search ? "Try a different search term" : "Create your first post to get started"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((blog, i) => (
                  <div
                    key={blog._id}
                    className="group flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md hover:shadow-blue-500/5 lg:flex-row lg:items-start lg:justify-between animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {/* Status left bar */}
                    <div
                      className={`absolute left-0 top-0 h-full w-0.5 rounded-l-xl transition-all ${
                        blog.status === "published"
                          ? "bg-emerald-500"
                          : blog.status === "draft"
                          ? "bg-orange-400"
                          : "bg-slate-300"
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                          {blog.title}
                        </h3>
                        <StatusBadge status={blog.status} />
                      </div>
                      {blog.excerpt && (
                        <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">{blog.excerpt}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>By {blog.authorName}</span>
                        <span>·</span>
                        <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <Eye className="h-3 w-3" />
                          {blog.views.toLocaleString()} views
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end lg:shrink-0">
                      <ProtectedSection resource="blogs" action="edit">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(blog)}
                          className="h-8 gap-1.5 text-xs"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </ProtectedSection>

                      {blog.status !== "published" && (
                        <ProtectedSection resource="blogs" action="publish">
                          <Button
                            size="sm"
                            onClick={() => void handlePublish(blog._id)}
                            disabled={busyId === blog._id}
                            className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 border-0"
                          >
                            {busyId === blog._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Send className="h-3.5 w-3.5" />
                            )}
                            Publish
                          </Button>
                        </ProtectedSection>
                      )}

                      {blog.status !== "archived" && (
                        <ProtectedSection resource="blogs" action="archive">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void handleArchive(blog._id)}
                            disabled={busyId === blog._id}
                            className="h-8 gap-1.5 text-xs text-slate-500"
                          >
                            {busyId === blog._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Archive className="h-3.5 w-3.5" />
                            )}
                            Archive
                          </Button>
                        </ProtectedSection>
                      )}
                    </div>
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
  accent = "text-slate-700",
  delay = 0,
}: {
  title: string;
  value: string | number;
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

function StatusBadge({ status }: { status: BlogPost["status"] }) {
  const config = {
    draft: {
      cls: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800",
      dot: "bg-orange-400",
    },
    published: {
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
      dot: "bg-emerald-500",
    },
    archived: {
      cls: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700",
      dot: "bg-slate-400",
    },
  };
  const { cls, dot } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

function formatDate(dateValue?: string | null) {
  if (!dateValue) return "Not published";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue));
}

function normalizeForm(form: BlogPayload): BlogPayload {
  return {
    title: form.title.trim(),
    excerpt: form.excerpt?.trim(),
    content: form.content?.trim(),
  };
}
