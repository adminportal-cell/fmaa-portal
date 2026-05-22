import { Briefcase } from "lucide-react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";

const industries = [
  "Investment Banking",
  "Private Equity",
  "Asset Management",
  "Consulting",
  "Hedge Funds",
  "Venture Capital",
  "Corporate Finance",
  "Markets",
];

export default function AlumniInsights() {
  return (
    <Layout>
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-12 max-w-6xl text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Briefcase className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Alumni Insights by Industry</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Honest accounts from FMAA alumni on what it's really like across the industry.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {industries.map((industry) => (
            <Card key={industry} className="hover-elevate transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="w-5 h-5 text-primary/70" />
                  <h3 className="font-semibold text-lg">{industry}</h3>
                </div>
                <p className="text-sm text-muted-foreground">Coming soon.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
