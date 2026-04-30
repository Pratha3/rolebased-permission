"use client";

import Footer from "@/components/common/footer";
import { ProtectedPage } from "@/components/permission/protectedPage";
import { ProtectedSection } from "@/components/permission/protectedSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Archive, Edit, Eye, FileText, Plus } from "lucide-react";

export default function BlogsPage() {
  return (
    <ProtectedPage resource="blogs" action="view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Blog Posts</h1>
            <p className="text-slate-500 mt-1">
              Manage your blog content and publications
            </p>
          </div>

          <ProtectedSection resource="blogs" action="create">
            <Button>
              <Plus className="h-4 w-4" />
              Create Post
            </Button>
          </ProtectedSection>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Eye className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Edit className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4546</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Blog Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex-1">
                  <h3 className="font-semibold">
                    Getting Started with Next.js 15
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                    <span>By John Doe</span>
                    <span>•</span>
                    <span>2024-03-01</span>
                    <span>•</span>
                    <span>1,234 views</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                      published
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ProtectedSection resource="blogs" action="edit">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </ProtectedSection>

                  <ProtectedSection resource="blogs" action="archive">
                    <Button variant="outline" size="sm">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </ProtectedSection>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex-1">
                  <h3 className="font-semibold">
                    Understanding React Server Components
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                    <span>By Jane Smith</span>
                    <span>•</span>
                    <span>2024-03-05</span>
                    <span>•</span>
                    <span>567 views</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-700">
                      draft
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ProtectedSection resource="blogs" action="edit">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </ProtectedSection>

                  <ProtectedSection resource="blogs" action="publish">
                    <Button size="sm">Publish</Button>
                  </ProtectedSection>

                  <ProtectedSection resource="blogs" action="archive">
                    <Button variant="outline" size="sm">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </ProtectedSection>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex-1">
                  <h3 className="font-semibold">
                    Building Scalable APIs with Node.js
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                    <span>By Mike Johnson</span>
                    <span>•</span>
                    <span>2024-03-10</span>
                    <span>•</span>
                    <span>2,341 views</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                      published
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ProtectedSection resource="blogs" action="edit">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </ProtectedSection>

                  <ProtectedSection resource="blogs" action="archive">
                    <Button variant="outline" size="sm">
                      <Archive className="h-4 w-4" />
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
