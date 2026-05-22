import { useState } from "react";
import { Link } from "wouter";
import { Search, Filter, BookOpen, Briefcase, FileText, Lock, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useListResources, useGetMe, ResourceCategory } from "@workspace/api-client-react";

import { Layout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categoryIcons: Record<string, React.ReactNode> = {
  cv: <FileText className="h-4 w-4" />,
  cover_letter: <FileText className="h-4 w-4" />,
  alumni_insight: <Briefcase className="h-4 w-4" />,
  technical: <BookOpen className="h-4 w-4" />,
  recruiting: <Briefcase className="h-4 w-4" />,
};

const categoryLabels: Record<string, string> = {
  cv: "CV Templates",
  cover_letter: "Cover Letters",
  alumni_insight: "Alumni Insights",
  technical: "Technical Guides",
  recruiting: "Recruiting Tips",
};

export default function ResourcesList() {
  const { data: me } = useGetMe();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ResourceCategory | "all">("all");
  
  // Use debounced search value in real app, but for now just pass search directly 
  // or filter client side if the API doesn't support search natively.
  // The API supports ?q= and ?category=
  const queryParams = {
    ...(category !== "all" ? { category: category as ResourceCategory } : {}),
    ...(search ? { q: search } : {})
  };
  
  const { data: resources, isLoading } = useListResources(queryParams, {
    query: {
      queryKey: ["resources", queryParams] as any
    }
  });

  return (
    <Layout>
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-12 max-w-5xl text-center">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Resource Library</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to break into top-tier finance and consulting. 
            From proprietary templates to technical guides.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search resources..." 
              className="pl-9 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={(v) => setCategory(v as ResourceCategory | "all")}>
            <SelectTrigger className="w-full sm:w-[200px] h-11">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="All Categories" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <Card key={i} className="p-5 flex gap-6">
                <Skeleton className="w-40 h-28 rounded-md" />
                <div className="flex-1 space-y-3 py-1">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))
          ) : resources?.length === 0 ? (
            <div className="text-center py-20 border border-dashed rounded-xl bg-muted/10">
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">No resources found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
              {(search || category !== "all") && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => { setSearch(""); setCategory("all"); }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {resources?.map((resource) => {
                const isLocked = resource.isPremium && !me?.isPremium;
                
                return (
                  <Link key={resource.id} href={`/resources/${resource.id}`}>
                    <Card className={`hover-elevate transition-shadow overflow-hidden group cursor-pointer ${isLocked ? 'opacity-90' : ''}`}>
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
                        ) : (
                          isLocked && (
                            <div className="hidden sm:flex w-16 bg-muted/30 items-start justify-center pt-6 border-r border-border">
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )
                        )}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors flex items-center gap-2">
                                {!resource.coverImageUrl && isLocked && <Lock className="w-4 h-4 text-muted-foreground sm:hidden" />}
                                {resource.title}
                              </h3>
                              {resource.isPremium && (
                                <Badge variant={isLocked ? "outline" : "secondary"} className={isLocked ? "" : "bg-accent/10 text-accent border-accent/20"}>
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground line-clamp-2 mb-4">
                              {resource.summary}
                            </p>
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
    </Layout>
  );
}
