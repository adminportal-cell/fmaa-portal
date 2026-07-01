import { Link } from "wouter";
import { ArrowRight, BookOpen, Briefcase, FileText, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useGetMe, useGetDashboardSummary } from "@workspace/api-client-react";

import { isTechnicalCategory, PREMIUM_BADGE_CLASS } from "@/lib/categories";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const categoryIcons: Record<string, React.ReactNode> = {
  cv: <FileText className="h-4 w-4" />,
  cover_letter: <FileText className="h-4 w-4" />,
  alumni_insight: <Briefcase className="h-4 w-4" />,
  technical: <BookOpen className="h-4 w-4" />,
  recruiting: <Briefcase className="h-4 w-4" />,
  behavioural_guide: <BookOpen className="h-4 w-4" />,
};

const categoryLabels: Record<string, string> = {
  cv: "CV Templates",
  cover_letter: "Cover Letters",
  alumni_insight: "Alumni Insights",
  technical: "Technical Guides",
  recruiting: "Recruiting Tips",
  behavioural_guide: "Behavioural Guides",
};

export default function Portal() {
  const { data: me, isLoading: meLoading } = useGetMe();
  const { data: summary } = useGetDashboardSummary();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (meLoading || !me) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-48" />
              {[1, 2].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-48" />
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-10">
        
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              {getGreeting()}, {me.name.split(' ')[0]}.
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Welcome back to the FMAA Portal.
            </p>
          </div>
        </section>

        {/* Stats Grid */}
        {(() => {
          const totalTechnical = (summary?.categoryCounts ?? [])
            .filter(c => isTechnicalCategory(c.category))
            .reduce((sum, c) => sum + c.count, 0);
          return (
            <section className="grid grid-cols-3 gap-4">
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-1">{summary?.totalResources ?? 0}</div>
                  <div className="text-sm font-medium text-muted-foreground">Total Resources</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-1">{summary?.totalAlumni ?? 0}</div>
                  <div className="text-sm font-medium text-muted-foreground">Alumni Profiles</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-1">{totalTechnical}</div>
                  <div className="text-sm font-medium text-muted-foreground">Technical Resources</div>
                </CardContent>
              </Card>
            </section>
          );
        })()}

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content: Recent Resources */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold">Latest Resources</h2>
              <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary">
                <Link href="/resources">View all <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </div>

            <div className="space-y-4">
              {(summary?.recentResources ?? []).length > 0 ? (
                (summary?.recentResources ?? []).map(resource => (
                  <Card key={resource.id} className="hover-elevate transition-shadow overflow-hidden group">
                    <div className="flex flex-col sm:flex-row">
                      {resource.coverImageUrl && (
                        <div className="sm:w-48 h-32 sm:h-auto bg-muted flex-shrink-0 overflow-hidden">
                          <img 
                            src={resource.coverImageUrl} 
                            alt={resource.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                              <Link href={`/resources/${resource.id}`}>{resource.title}</Link>
                            </h3>
                            {resource.isPremium && (
                              <Badge variant="secondary" className={PREMIUM_BADGE_CLASS}>
                                Premium
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                            {resource.summary}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {resource.categories.map(c => (
                            <span key={c} className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                              {categoryIcons[c]}
                              {categoryLabels[c] || c}
                            </span>
                          ))}
                          <span>{format(new Date(resource.createdAt), "MMM d, yyyy")}</span>
                          {resource.readingMinutes && (
                            <span>{resource.readingMinutes} min read</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 border border-dashed rounded-xl bg-muted/20">
                  <p className="text-muted-foreground">No resources available yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Featured Alumni */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold">Featured Alumni</h2>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary">
                <Link href="/alumni">All <ArrowRight className="ml-1 w-3 h-3" /></Link>
              </Button>
            </div>

            <div className="space-y-4">
              {(summary?.featuredAlumni ?? []).length > 0 ? (
                (summary?.featuredAlumni ?? []).map(alumnus => (
                  <Link key={alumnus.id} href={`/alumni/${alumnus.id}`}>
                    <Card className="hover-elevate cursor-pointer transition-shadow">
                      <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12 border border-border">
                          <AvatarImage src={alumnus.headshotUrl || undefined} alt={alumnus.name} className="object-cover" />
                          <AvatarFallback className="bg-primary/5 text-primary">
                            {alumnus.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-foreground">{alumnus.name}</div>
                          <div className="text-sm text-muted-foreground leading-tight">
                            {alumnus.role} <br/>at <span className="text-primary font-medium">{alumnus.company}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 border border-dashed rounded-xl bg-muted/20">
                  <p className="text-muted-foreground text-sm">No alumni profiles yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
