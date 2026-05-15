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
  Send,
  X,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const emptyForm: BlogPayload = {
  title: "",
  excerpt: "",
  content: "",
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<BlogPayload>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const stats = useMemo(() => {
    return {
      total: blogs.length,
      published: blogs.filter((blog) => blog.status === "published").length,
      drafts: blogs.filter((blog) => blog.status === "draft").length,
      views: blogs.reduce((sum, blog) => sum + (blog.views || 0), 0),
    };
  }, [blogs]);

  useEffect(() => {
    void loadBlogs();
  }, []);

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
  }

  function startEdit(blog: BlogPost) {
    setEditingId(blog._id);
    setForm({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
    });
    setShowForm(true);
  }

  function closeForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setIsSaving(true);
      if (editingId) {
        const updated = await updateBlog(editingId, normalizeForm(form));
        setBlogs((current) =>
          current.map((blog) => (blog._id === editingId ? updated : blog)),
        );
        toast.success("Blog post updated");
      } else {
        const created = await createBlog(normalizeForm(form));
        setBlogs((current) => [created, ...current]);
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
      setBlogs((current) =>
        current.map((blog) => (blog._id === blogId ? updated : blog)),
      );
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
      setBlogs((current) =>
        current.map((blog) => (blog._id === blogId ? updated : blog)),
      );
      toast.success("Blog post archived");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ProtectedPage resource="blogs" action="view">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Blog Posts</h1>
            <p className="mt-1 text-slate-500">
              Manage real blog drafts, publishing, and archived content.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void loadBlogs()} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Refresh
            </Button>
            <ProtectedSection resource="blogs" action="create">
              <Button onClick={startCreate}>
                <Plus className="h-4 w-4" />
                Create Post
              </Button>
            </ProtectedSection>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Posts" value={stats.total} icon={<FileText className="h-4 w-4 text-slate-500" />} />
          <StatCard title="Published" value={stats.published} icon={<Eye className="h-4 w-4 text-green-500" />} />
          <StatCard title="Drafts" value={stats.drafts} icon={<Edit className="h-4 w-4 text-orange-500" />} />
          <StatCard title="Total Views" value={stats.views.toLocaleString()} icon={<Eye className="h-4 w-4 text-blue-500" />} />
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Edit Blog Post" : "Create Blog Post"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="blog-title">Title</Label>
                    <Input
                      id="blog-title"
                      value={form.title}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, title: event.target.value }))
                      }
                      placeholder="Write a clear post title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blog-excerpt">Excerpt</Label>
                    <Input
                      id="blog-excerpt"
                      value={form.excerpt}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, excerpt: event.target.value }))
                      }
                      placeholder="Short summary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-content">Content</Label>
                  <Textarea
                    id="blog-content"
                    value={form.content}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, content: event.target.value }))
                    }
                    placeholder="Write the post content"
                    rows={6}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    {editingId ? "Save Changes" : "Create Draft"}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeForm}>
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Blog Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading blog posts
              </div>
            ) : blogs.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-slate-500">
                No blog posts yet.
              </div>
            ) : (
              <div className="space-y-4">
                {blogs.map((blog) => (
                  <div
                    key={blog._id}
                    className="flex flex-col gap-4 rounded-lg border p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 lg:flex-row lg:items-start lg:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{blog.title}</h3>
                        <StatusBadge status={blog.status} />
                      </div>
                      {blog.excerpt && (
                        <p className="mt-2 text-sm text-slate-600">{blog.excerpt}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span>By {blog.authorName}</span>
                        <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                        <span>{blog.views.toLocaleString()} views</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <ProtectedSection resource="blogs" action="edit">
                        <Button variant="outline" size="sm" onClick={() => startEdit(blog)}>
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </ProtectedSection>

                      {blog.status !== "published" && (
                        <ProtectedSection resource="blogs" action="publish">
                          <Button
                            size="sm"
                            onClick={() => void handlePublish(blog._id)}
                            disabled={busyId === blog._id}
                          >
                            {busyId === blog._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
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
                          >
                            {busyId === blog._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Archive className="h-4 w-4" />
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
}: {
  title: string;
  value: string | number;
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

function StatusBadge({ status }: { status: BlogPost["status"] }) {
  const classes = {
    draft: "bg-orange-100 text-orange-700",
    published: "bg-green-100 text-green-700",
    archived: "bg-slate-100 text-slate-700",
  };

  return (
    <span className={`rounded px-2 py-0.5 text-xs ${classes[status]}`}>
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
