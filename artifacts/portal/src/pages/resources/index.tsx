import { useState } from "react";
import { Link } from "wouter";
import { Search, BookOpen, Briefcase, FileText, Lock, ChevronRight, Plus, Pencil, Trash2, GraduationCap, LayoutGrid } from "lucide-react";
import { format } from "date-fns";
import { useListResources, useGetMe, useDeleteResource, Resource } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";

import { Layout } from "@/components/layout";
import { ResourceFormDialog } from "@/components/resource-form-dialog";
import { KNOWN_CATEGORIES } from "@/lib/categories";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

// Categories that live in Technicals, not here
const TECHNICAL_ONLY_CATS = new Set(["accounting", "valuation", "dcf", "lbo", "m&a", "excel"]);

const CATEGORY_TILES = [
  { value: "cv",               label: "CV Templates",       Icon: FileText,     description: "Resume templates from top finance alumni." },
  { value: "cover_letter",     label: "Cover Letters",      Icon: FileText,     description: "Cover letter guides for IB, AM, and consulting." },
  { value: "alumni_insight",   label: "Alumni Insights",    Icon: GraduationCap, description: "First-hand notes from FMAA alumni." },
  { value: "recruiting",       label: "Recruiting",         Icon: Briefcase,    description: "Exclusive recruiting tips and strategies." },
  { value: "behavioural_guide",label: "Behavioural",        Icon: BookOpen,     description: "Behavioural interview frameworks." },
  { value: "technical",        label: "Technical Guides",   Icon: BookOpen,     description: "General technical reference materials." },
  { value: "miscellaneous",    label: "Miscellaneous",      Icon: LayoutGrid,   description: "Other helpful resources." },
];

const categoryIcons: Record<string, React.ReactNode> = {
  cv:               <FileText className="h-4 w-4" />,
  cover_letter:     <FileText className="h-4 w-4" />,
  alumni_insight:   <Briefcase className="h-4 w-4" />,
  technical:        <BookOpen className="h-4 w-4" />,
  recruiting:       <Briefcase className="h-4 w-4" />,
  behavioural_guide:<Briefcase className="h-4 w-4" />,
  miscellaneous:    <LayoutGrid className="h-4 w-4" />,
};

const categoryLabels: Record<string, string> = {
  cv:               "CV Templates",
  cover_letter:     "Cover Letters",
  alumni_insight:   "Alumni Insights",
  technical:        "Technical Guides",
  recruiting:       "Recruiting",
  behavioural_guide:"Behavioural",
  miscellaneous:    "Miscellaneous",
};

export default function ResourcesList() {
  const { toast } = useToast();
  const { data: me } = useGetMe();
  const isAdmin = me?.isAdmin ?? false;

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Resource | undefined>(undefined);

  const { data: allResources, isLoading } = useListResources({}, {
    query: { queryKey: ["resources", "all"] as any }
  });

  const deleteResource = useDeleteResource();

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this resource? This cannot be undone.")) return;
    deleteResource.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Resource deleted" });
        queryClient.invalidateQueries({ queryKey: ["resources"] });
      },
      onError: (err: Error) => toast({ title: "Failed to delete", description: err.message, variant: "destructive" }),
    });
  };

  const openEdit = (e: React.MouseEvent, resource: Resource) => {
    e.preventDefault();
    e.stopPropagation();
    setEditTarget(resource);
    setFormOpen(true);
  };

  const resources = (allResources ?? [])
    .filter(r => !TECHNICAL_ONLY_CATS.has(r.category))
    .filter(r => !activeCategory || r.category === activeCategory)
    .filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.summary.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      {isAdmin && (
        <div className="bg-primary/5 border-b border-primary/20">
          <div className="container mx-auto px-4 py-3 max-w-5xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Admin — editing live
            </div>
            <Button size="sm" onClick={() => { setEditTarget(undefined); setFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Resource
            </Button>
          </div>
        </div>
      )}

      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-12 max-w-5xl text-center">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Resource Library</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            CV templates, cover letters, alumni insights and more — everything you need to break into top-tier finance.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">

        {/* Category Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
          {CATEGORY_TILES.map(({ value, label, Icon, description }) => {
            const isActive = activeCategory === value;
            return (
              <button
                key={value}
                onClick={() => setActiveCategory(isActive ? null : value)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className={`font-semibold text-sm ${isActive ? "text-primary" : "text-foreground"}`}>{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{description}</div>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-9 h-11"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Active filter label */}
        {activeCategory && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{categoryLabels[activeCategory] || activeCategory}</h2>
            <Button variant="ghost" size="sm" onClick={() => setActiveCategory(null)} className="text-muted-foreground">
              Clear filter
            </Button>
          </div>
        )}

        {/* Resource List */}
        <div className="space-y-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="p-5 flex gap-6">
                <Skeleton className="w-40 h-28 rounded-md" />
                <div className="flex-1 space-y-3 py-1">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))
          ) : resources.length === 0 ? (
            <div className="text-center py-20 border border-dashed rounded-xl bg-muted/10">
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">No resources found</h3>
              <p className="text-muted-foreground">
                {activeCategory
                  ? `No ${categoryLabels[activeCategory] || activeCategory} resources yet.`
                  : "Try adjusting your search or selecting a category above."}
              </p>
              {(search || activeCategory) && (
                <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setActiveCategory(null); }}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {resources.map(resource => {
                const isLocked = resource.isPremium && !me?.isPremium;
                return (
                  <Link key={resource.id} href={`/resources/${resource.id}`}>
                    <Card className={`hover-elevate transition-shadow overflow-hidden group cursor-pointer ${isLocked ? "opacity-90" : ""}`}>
                      <div className="flex flex-col sm:flex-row h-full">
                        {resource.coverImageUrl ? (
                          <div className="sm:w-48 h-40 sm:h-auto bg-muted flex-shrink-0 overflow-hidden relative">
                            <img
                              src={resource.coverImageUrl}
                              alt={resource.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {isLocked && (
                              <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                                <div className="bg-background/90 p-2 rounded-full shadow-sm">
                                  <Lock className="w-5 h-5 text-muted-foreground" />
                                </div>
                              </div>
                            )}
                          </div>
                        ) : isLocked ? (
                          <div className="hidden sm:flex w-16 bg-muted/30 items-start justify-center pt-6 border-r border-border">
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          </div>
                        ) : null}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors">
                                {resource.title}
                              </h3>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {resource.isPremium && (
                                  <Badge variant={isLocked ? "outline" : "secondary"} className={isLocked ? "" : "bg-accent/10 text-accent border-accent/20"}>
                                    Premium
                                  </Badge>
                                )}
                                {isAdmin && (
                                  <>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={e => openEdit(e, resource)}>
                                      <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={e => handleDelete(e, resource.id)}>
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                            <p className="text-muted-foreground line-clamp-2 mb-4">{resource.summary}</p>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5 font-medium text-foreground bg-muted/50 px-2.5 py-1 rounded-md">
                                {categoryIcons[resource.category]}
                                {categoryLabels[resource.category] || resource.category}
                              </span>
                              <span>{resource.authorName}</span>
                              <span className="hidden sm:inline">&bull;</span>
                              <span>{format(new Date(resource.createdAt), "MMM d, yyyy")}</span>
                              {resource.readingMinutes && (
                                <>
                                  <span className="hidden sm:inline">&bull;</span>
                                  <span>{resource.readingMinutes} min read</span>
                                </>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ResourceFormDialog
        open={formOpen}
        onOpenChange={o => { setFormOpen(o); if (!o) setEditTarget(undefined); }}
        initial={editTarget}
        categories={KNOWN_CATEGORIES}
      />
    </Layout>
  );
}
