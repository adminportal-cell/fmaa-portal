import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Plus, Pencil, Trash2, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useListResources, useGetMe, useDeleteResource } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Layout } from "@/components/layout";
import { ResourceFormDialog } from "@/components/resource-form-dialog";
import { TECHNICAL_CATEGORIES } from "@/lib/categories";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface TopicPageProps {
  title: string;
  description: string;
  tag: string;
}

function TechnicalTopicPage({ title, description, tag }: TopicPageProps) {
  const { toast } = useToast();
  const { data: me } = useGetMe();
  const isAdmin = me?.isAdmin ?? false;
  const deleteResource = useDeleteResource();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(undefined);

  const { data: articles = [], isLoading } = useListResources({ category: tag as any }, {
    query: { queryKey: ["resources", tag] as any }
  });

  // The dialog's category is fixed to this topic. Ensure the topic's own
  // category is selectable even if it's not in the shared picker (e.g. DCF/LBO,
  // which were removed from the general "Add Technical Resource" dropdown).
  const dialogCategories = TECHNICAL_CATEGORIES.some(c => c.value === tag)
    ? TECHNICAL_CATEGORIES
    : [...TECHNICAL_CATEGORIES, { value: tag, label: title }];

  const handleDelete = (id: number) => {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    deleteResource.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Article deleted" });
        queryClient.invalidateQueries({ queryKey: ["resources"] });
      },
      onError: (err: Error) => toast({ title: "Failed to delete", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <Layout>
      {isAdmin && (
        <div className="bg-primary/5 border-b border-primary/20">
          <div className="container mx-auto px-4 py-3 max-w-4xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Admin — editing live
            </div>
            <Button size="sm" onClick={() => { setEditTarget(undefined); setFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add {title} Article
            </Button>
          </div>
        </div>
      )}

      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground">
            <Link href="/technicals"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Technicals</Link>
          </Button>
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-4xl font-serif font-bold text-foreground">{title}</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i}><CardContent className="p-8 space-y-4"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /></CardContent></Card>
          ))
        ) : articles.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">{title} content coming soon</h3>
              <p className="text-muted-foreground mb-6">
                In-depth {title.toLowerCase()} guides and frameworks will be published here.
              </p>
              {isAdmin && (
                <Button onClick={() => { setEditTarget(undefined); setFormOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" /> Add the first article
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          articles.map(article => (
            <Card key={article.id} className="overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-serif font-bold text-foreground mb-2">{article.title}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span>{article.authorName}</span>
                      {article.readingMinutes && (
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.readingMinutes} min read</span>
                      )}
                      {article.isPremium && (
                        <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">Premium</Badge>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => { setEditTarget(article); setFormOpen(true); }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(article.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground mb-6 text-base leading-relaxed">{article.summary}</p>

                <div className="prose prose-base dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-a:text-primary border-t border-border pt-6">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {article.content}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ResourceFormDialog
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) setEditTarget(undefined); }}
        initial={editTarget}
        defaultCategory={tag}
        defaultTag={tag}
        categories={dialogCategories}
        onSuccess={() => { setFormOpen(false); setEditTarget(undefined); }}
      />
    </Layout>
  );
}

export function AccountingPage() {
  return <TechnicalTopicPage title="Accounting" description="Three statements, ratios, and core accounting concepts." tag="accounting" />;
}

export function ValuationPage() {
  return <TechnicalTopicPage title="Valuation" description="Trading comps, transaction comps, and valuation frameworks." tag="valuation" />;
}

export function DcfPage() {
  return <TechnicalTopicPage title="DCF" description="Discounted cash flow modelling from first principles." tag="dcf" />;
}

export function LboPage() {
  return <TechnicalTopicPage title="LBO" description="Leveraged buyout structures, returns, and modelling." tag="lbo" />;
}

export function MAndAPage() {
  return <TechnicalTopicPage title="M&A" description="Merger mechanics, accretion/dilution, and deal considerations." tag="m&a" />;
}

export function ExcelPage() {
  return <TechnicalTopicPage title="Excel" description="Shortcuts, functions, and modelling best practices for Excel." tag="excel" />;
}

export function MiscellaneousPage() {
  return <TechnicalTopicPage title="Miscellaneous" description="Additional technical topics and supplementary guides." tag="miscellaneous" />;
}
