import { useState } from "react";
import { Link } from "wouter";
import { BookOpen, ChevronRight, Plus, Search, X, Lock } from "lucide-react";
import { useGetMe, useListResources } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ResourceFormDialog } from "@/components/resource-form-dialog";
import { TECHNICAL_CATEGORIES, isTechnicalCategory } from "@/lib/categories";

const topics = [
  { slug: "accounting",   title: "Accounting",    description: "Three statements, ratios, and core accounting concepts.", tag: "accounting" },
  { slug: "valuation",    title: "Valuation",     description: "Trading comps, transaction comps, and valuation frameworks.", tag: "valuation" },
  { slug: "dcf",          title: "DCF",           description: "Discounted cash flow modelling from first principles.", tag: "dcf" },
  { slug: "lbo",          title: "LBO",           description: "Leveraged buyout structures, returns, and modelling.", tag: "lbo" },
  { slug: "m-and-a",      title: "M&A",           description: "Merger mechanics, accretion/dilution, and deal considerations.", tag: "m&a" },
  { slug: "excel",        title: "Excel",         description: "Shortcuts, functions, and modelling best practices for Excel.", tag: "excel" },
  { slug: "miscellaneous",title: "Miscellaneous", description: "Additional technical topics and supplementary guides.", tag: "miscellaneous" },
];

const topicTitleByTag: Record<string, string> = Object.fromEntries(
  topics.map(t => [t.tag, t.title]),
);

export default function TechnicalsIndex() {
  const { data: me } = useGetMe();
  const isAdmin = me?.isAdmin ?? false;
  const [formOpen, setFormOpen] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");

  // Only fetch once a search has been submitted (Enter). Until then the page
  // shows topic tiles only — technical resources are reached by clicking a tile.
  const { data: allResources = [] } = useListResources({}, {
    query: { queryKey: ["resources", "all"] as any, enabled: query.length > 0 },
  });

  const results = query
    ? allResources
        .filter(r => isTechnicalCategory(r.category))
        .filter(r =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.summary.toLowerCase().includes(query.toLowerCase())
        )
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setQuery("");
  };

  return (
    <Layout>
      {isAdmin && (
        <div className="bg-primary/5 border-b border-primary/20">
          <div className="container mx-auto px-4 py-3 max-w-5xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Admin — editing live
            </div>
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Technical Resource
            </Button>
          </div>
        </div>
      )}

      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-12 max-w-5xl text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Technicals</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Interview-ready technical guides for finance recruiting.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Search — surfaces technical resources only on Enter */}
        <form onSubmit={handleSearch} className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search technical resources, then press Enter..."
            className="pl-9 pr-10 h-11"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {query ? (
          /* Search results */
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {results.length} result{results.length === 1 ? "" : "s"} for “{query}”
              </h2>
              <Button variant="ghost" size="sm" onClick={clearSearch} className="text-muted-foreground">
                Back to topics
              </Button>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-20 border border-dashed rounded-xl bg-muted/10">
                <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">No technical resources found</h3>
                <p className="text-muted-foreground">Try a different search, or browse the topics.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {results.map(resource => {
                  const isLocked = resource.isPremium && !me?.isPremium;
                  return (
                    <Link key={resource.id} href={`/resources/${resource.id}`}>
                      <Card className="hover-elevate transition-shadow cursor-pointer group">
                        <CardContent className="p-5 flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {topicTitleByTag[resource.category] || resource.category}
                              </Badge>
                              {resource.isPremium && (
                                <Badge variant="outline" className="text-xs">Premium</Badge>
                              )}
                            </div>
                            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors truncate">
                              {resource.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{resource.summary}</p>
                          </div>
                          {isLocked ? (
                            <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Topic tiles */
          <div className="grid md:grid-cols-2 gap-4">
            {topics.map(topic => (
              <Link key={topic.slug} href={`/technicals/${topic.slug}`}>
                <Card className="hover-elevate transition-shadow cursor-pointer group h-full">
                  <CardContent className="p-6 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{topic.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ResourceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        categories={TECHNICAL_CATEGORIES}
        onSuccess={() => setFormOpen(false)}
      />
    </Layout>
  );
}
