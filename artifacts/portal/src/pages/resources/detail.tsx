import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, FileText, Lock, Clock, Calendar, Download, Pencil } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useGetResource, useGetMe, useMarkResourceViewed } from "@workspace/api-client-react";

import { Layout } from "@/components/layout";
import { ResourceFormDialog } from "@/components/resource-form-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const categoryLabels: Record<string, string> = {
  cv: "CV Templates",
  cover_letter: "Cover Letters",
  alumni_insight: "Alumni Insights",
  technical: "Technical Guides",
  recruiting: "Recruiting Tips",
};

export default function ResourceDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  
  const { data: me } = useGetMe();
  const { data: resource, isLoading } = useGetResource(id);
  const markViewed = useMarkResourceViewed();
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (resource && id) {
      markViewed.mutate({ id });
    }
  }, [resource?.id]);

  if (isLoading || !resource) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </Layout>
    );
  }

  const isLocked = resource.isPremium && !me?.isPremium;

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" asChild className="-ml-4 text-muted-foreground hover:text-foreground">
              <Link href="/resources">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Resources
              </Link>
            </Button>
            {me?.isAdmin && (
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="w-4 h-4 mr-2" /> Edit Resource
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              {categoryLabels[resource.category] || resource.category}
            </Badge>
            {resource.isPremium && (
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                Premium
              </Badge>
            )}
            {resource.tags?.map(tag => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
            {resource.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {resource.authorName.charAt(0)}
              </div>
              <span className="font-medium text-foreground">{resource.authorName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(resource.createdAt), "MMMM d, yyyy")}</span>
            </div>
            {resource.readingMinutes && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{resource.readingMinutes} min read</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {resource.coverImageUrl && (
          <div className="rounded-xl overflow-hidden mb-12 shadow-sm border border-border">
            <img 
              src={resource.coverImageUrl} 
              alt={resource.title} 
              className="w-full h-auto max-h-[500px] object-cover" 
            />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-a:text-primary">
          <p className="lead text-xl text-muted-foreground mb-8">
            {resource.summary}
          </p>

          {isLocked ? (
            <>
              <div className="relative">
                <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
                <div className="opacity-40 select-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {resource.content.substring(0, 800) + "..."}
                  </ReactMarkdown>
                </div>
              </div>

              <Card className="mt-8 border-accent/20 bg-accent/5 shadow-md relative z-20">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-4">Premium Content</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    This resource contains proprietary insights, templates, or technical guides reserved for FMAA Premium members.
                  </p>
                  <div className="flex justify-center">
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/resources">Browse Other Resources</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {resource.fileUrl && (
                <div className="not-prose mb-8 p-6 bg-card border border-border rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Attached File</h4>
                      <p className="text-sm text-muted-foreground">Download the original template or document</p>
                    </div>
                  </div>
                  <Button asChild>
                    <a
                      href={resource.fileUrl}
                      download={resource.fileUrl.startsWith("data:") ? "download" : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download
                    </a>
                  </Button>
                </div>
              )}

              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {resource.content}
              </ReactMarkdown>
            </>
          )}
        </div>
      </div>

      <ResourceFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={resource}
        onSuccess={() => setEditOpen(false)}
      />
    </Layout>
  );
}
