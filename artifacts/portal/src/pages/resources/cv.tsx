import { FileText } from "lucide-react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";

export default function CvResources() {
  return (
    <Layout>
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-12 max-w-5xl text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">CV Resources</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Proven CV templates and guidance for finance and consulting applications.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">CV templates and guides coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
