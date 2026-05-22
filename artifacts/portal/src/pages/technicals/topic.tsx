import { Link } from "wouter";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TopicPageProps {
  title: string;
  description: string;
}

export function TechnicalTopicPage({ title, description }: TopicPageProps) {
  return (
    <Layout>
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

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">{title} content coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export function AccountingPage() {
  return <TechnicalTopicPage title="Accounting" description="Three statements, ratios, and core accounting concepts." />;
}

export function ValuationPage() {
  return <TechnicalTopicPage title="Valuation" description="Trading comps, transaction comps, and valuation frameworks." />;
}

export function DcfPage() {
  return <TechnicalTopicPage title="DCF" description="Discounted cash flow modelling from first principles." />;
}

export function LboPage() {
  return <TechnicalTopicPage title="LBO" description="Leveraged buyout structures, returns, and modelling." />;
}

export function MAndAPage() {
  return <TechnicalTopicPage title="M&A" description="Merger mechanics, accretion/dilution, and deal considerations." />;
}
