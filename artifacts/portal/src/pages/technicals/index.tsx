import { Link } from "wouter";
import { BookOpen, ChevronRight } from "lucide-react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";

const topics = [
  { slug: "accounting", title: "Accounting", description: "Three statements, ratios, and core accounting concepts." },
  { slug: "valuation", title: "Valuation", description: "Trading comps, transaction comps, and valuation frameworks." },
  { slug: "dcf", title: "DCF", description: "Discounted cash flow modelling from first principles." },
  { slug: "lbo", title: "LBO", description: "Leveraged buyout structures, returns, and modelling." },
  { slug: "m-and-a", title: "M&A", description: "Merger mechanics, accretion/dilution, and deal considerations." },
];

export default function TechnicalsIndex() {
  return (
    <Layout>
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
        <div className="grid md:grid-cols-2 gap-4">
          {topics.map((topic) => (
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
      </div>
    </Layout>
  );
}
