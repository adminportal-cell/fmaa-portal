import { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, MapPin, Building2, GraduationCap, Linkedin, Quote, Pencil } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useGetAlumni, useGetMe } from "@workspace/api-client-react";

import { Layout } from "@/components/layout";
import { AlumniFormDialog } from "@/components/alumni-form-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export default function AlumniDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  
  const { data: alumni, isLoading } = useGetAlumni(id);
  const { data: me } = useGetMe();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading || !alumni) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
          <Skeleton className="h-10 w-32" />
          <div className="flex gap-8 items-start">
            <Skeleton className="h-48 w-48 rounded-2xl" />
            <div className="space-y-4 flex-1">
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-1/4" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header Profile Section */}
      <div className="bg-primary text-primary-foreground border-b border-primary-foreground/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-bg.png')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" asChild className="-ml-4 text-primary-foreground/80 hover:text-white hover:bg-white/10">
              <Link href="/alumni">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
              </Link>
            </Button>
            {me?.isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
            <Avatar className="h-40 w-40 border-4 border-white/20 shadow-2xl">
              <AvatarImage src={alumni.headshotUrl || undefined} alt={alumni.name} className="object-cover" />
              <AvatarFallback className="bg-primary/50 text-white text-4xl font-serif">
                {alumni.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">
                {alumni.name}
              </h1>
              <div className="text-xl md:text-2xl text-accent font-medium mb-6">
                {alumni.role} at {alumni.company}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-4 text-primary-foreground/80">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  <span className="text-lg">{alumni.industry}</span>
                </div>
                {alumni.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg">{alumni.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-lg">Class of {alumni.gradYear}</span>
                </div>
              </div>
              
              {alumni.linkedinUrl && (
                <div className="mt-8">
                  <Button variant="outline" asChild className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm">
                    <a href={alumni.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-4 h-4 mr-2" /> Connect on LinkedIn
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Insight Section */}
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
            <Quote className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-foreground">Alumni Insight</h2>
        </div>
        
        <Card className="border-border shadow-md bg-card relative">
          <CardContent className="p-8 md:p-10">
            <div className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-serif">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {alumni.insight}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlumniFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={alumni}
        onSuccess={() => setEditOpen(false)}
      />
    </Layout>
  );
}
