import { useState } from "react";
import { Link } from "wouter";
import { Search, MapPin, GraduationCap, ChevronRight, Briefcase, Plus, Pencil, Trash2 } from "lucide-react";
import { useListAlumni, useListIndustries, useDeleteAlumni, useGetMe, AlumniProfile } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";

import { Layout } from "@/components/layout";
import { AlumniFormDialog } from "@/components/alumni-form-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

export default function AlumniList() {
  const { toast } = useToast();
  const { data: me } = useGetMe();
  const isAdmin = me?.isAdmin ?? false;

  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AlumniProfile | undefined>(undefined);

  const queryParams = industry !== "all" ? { industry } : {};
  
  const { data: alumni, isLoading: alumniLoading } = useListAlumni(queryParams, {
    query: { queryKey: ["alumni", queryParams] as any }
  });

  const { data: industries, isLoading: industriesLoading } = useListIndustries();
  const deleteAlumni = useDeleteAlumni();

  const filteredAlumni = alumni?.filter(a => 
    !search || 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.company.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this alumni profile? This cannot be undone.")) return;
    deleteAlumni.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Profile deleted" });
        queryClient.invalidateQueries({ queryKey: ["/api/alumni"] });
      },
      onError: (err: Error) => toast({ title: "Failed to delete", description: err.message, variant: "destructive" }),
    });
  };

  const openEdit = (e: React.MouseEvent, alumnus: AlumniProfile) => {
    e.preventDefault();
    e.stopPropagation();
    setEditTarget(alumnus);
    setFormOpen(true);
  };

  return (
    <Layout>
      {isAdmin && (
        <div className="bg-primary/5 border-b border-primary/20">
          <div className="container mx-auto px-4 py-3 max-w-6xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Admin — editing live
            </div>
            <Button size="sm" onClick={() => { setEditTarget(undefined); setFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Alumni
            </Button>
          </div>
        </div>
      )}

      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-12 max-w-6xl text-center">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Alumni Directory</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with FMAA alumni at top firms globally. Read their insights on breaking into the industry and firm culture.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, company, or role..." 
              className="pl-9 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-full">
            {industriesLoading ? (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-9 w-24 rounded-full" />)}
              </div>
            ) : industries && industries.length > 0 ? (
              <ScrollArea className="w-full whitespace-nowrap pb-4">
                <div className="flex w-max space-x-2">
                  <Button
                    variant={industry === "all" ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setIndustry("all")}
                  >
                    All Industries
                  </Button>
                  {industries.map(ind => (
                    <Button
                      key={ind.industry}
                      variant={industry === ind.industry ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => setIndustry(ind.industry)}
                    >
                      {ind.industry} <span className="ml-2 text-xs opacity-50">{ind.count}</span>
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            ) : null}
          </div>
        </div>

        {alumniLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
              </Card>
            ))}
          </div>
        ) : filteredAlumni?.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-xl bg-muted/10">
            <GraduationCap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No alumni found</h3>
            <p className="text-muted-foreground">We couldn't find any alumni matching your search.</p>
            {(search || industry !== "all") && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => { setSearch(""); setIndustry("all"); }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlumni?.map((alumnus) => (
              <Link key={alumnus.id} href={`/alumni/${alumnus.id}`}>
                <Card className="h-full hover-elevate transition-shadow cursor-pointer group flex flex-col relative">
                  {isAdmin && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground shadow-sm"
                        onClick={(e) => openEdit(e, alumnus)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-background/80 backdrop-blur-sm text-destructive hover:bg-destructive/10 shadow-sm"
                        onClick={(e) => handleDelete(e, alumnus.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16 border-2 border-border shadow-sm">
                        <AvatarImage src={alumnus.headshotUrl || undefined} alt={alumnus.name} className="object-cover" />
                        <AvatarFallback className="bg-primary/5 text-primary text-xl">
                          {alumnus.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors leading-tight">
                          {alumnus.name}
                        </h3>
                        <p className="text-muted-foreground font-medium text-sm mt-1 leading-tight">
                          {alumnus.role}
                        </p>
                        <p className="text-primary font-semibold text-sm mt-1">
                          {alumnus.company}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-auto text-sm text-muted-foreground mb-4 bg-muted/30 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary/70" />
                        <span>{alumnus.industry}</span>
                      </div>
                      {alumnus.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary/70" />
                          <span>{alumnus.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-primary/70" />
                        <span>Class of {alumnus.gradYear}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-border">
                      <span className="text-sm font-medium text-accent">View Insight</span>
                      <ChevronRight className="w-5 h-5 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <AlumniFormDialog
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) setEditTarget(undefined); }}
        initial={editTarget}
      />
    </Layout>
  );
}
