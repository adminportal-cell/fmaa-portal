import { Link } from "wouter";
import { Crown, Check, Shield, ArrowLeft, Mail } from "lucide-react";
import { useGetMe } from "@workspace/api-client-react";

import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Upgrade() {
  const { data: me, isLoading: meLoading } = useGetMe();

  if (meLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto mb-16" />
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Skeleton className="h-[500px] rounded-2xl" />
            <Skeleton className="h-[500px] rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  const isPremium = me?.isPremium;

  return (
    <Layout>
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <Button variant="ghost" asChild className="mb-8 text-muted-foreground hover:text-foreground">
            <Link href="/portal">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Link>
          </Button>

          <Badge variant="secondary" className="mb-6 bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 px-4 py-1">
            FMAA Membership
          </Badge>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            {isPremium ? "Your Premium Membership" : "Premium Access for FMAA Members"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isPremium
              ? "You have full access to all FMAA resources, templates and insights."
              : "Premium access is included with your FMAA membership at the university \u2014 there is nothing to pay on this site."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">

          {/* Standard Plan */}
          <Card className={`relative ${!isPremium ? "border-primary/20 shadow-md ring-1 ring-primary/10" : "border-border"}`}>
            {!isPremium && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Current Access
              </div>
            )}
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-bold font-serif mb-2">Standard</CardTitle>
              <CardDescription className="text-base">
                Basic access to community and public resources.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <ul className="space-y-4">
                {[
                  "Access to public technical guides",
                  "Browse alumni directory",
                  "Weekly newsletter",
                  "Standard event invitations",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
                {[
                  "Proprietary CV templates",
                  "Successful cover letters",
                  "Advanced modeling guides",
                  "Firm-specific insights",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start opacity-40">
                    <Check className="h-5 w-5 mr-3 shrink-0" />
                    <span className="text-muted-foreground line-through">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className={`relative overflow-hidden ${isPremium ? "border-accent shadow-xl ring-2 ring-accent/20" : "border-accent/40 shadow-lg"}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />

            {isPremium && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 z-10">
                <Crown className="w-3 h-3" /> Active
              </div>
            )}

            <CardHeader className="p-8 pb-4 relative z-10">
              <CardTitle className="text-2xl font-bold font-serif flex items-center gap-2 text-primary">
                <Crown className="w-6 h-6 text-accent" /> Premium
              </CardTitle>
              <CardDescription className="text-base text-primary/70">
                The full FMAA toolkit, included with your paid membership.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 relative z-10">
              <ul className="space-y-4">
                {[
                  "Everything in Standard",
                  "Proprietary CV templates",
                  "Successful cover letters",
                  "Advanced modeling guides",
                  "Firm-specific insights",
                  "Priority event registration",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-accent mr-3 shrink-0" />
                    <span className="font-medium text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-8 pt-0 relative z-10">
              {isPremium ? (
                <div className="w-full bg-primary/5 rounded-lg p-4 flex items-center gap-3 border border-primary/10">
                  <Shield className="w-5 h-5 text-primary" />
                  <div className="text-sm">
                    <div className="font-semibold text-primary">Premium access active</div>
                    <div className="text-muted-foreground">Your email is on the approved FMAA member list.</div>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-muted/50 rounded-lg p-4 border border-border space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary shrink-0" />
                    <div className="text-sm">
                      <div className="font-semibold text-primary">Verified through your FMAA membership</div>
                      <div className="text-muted-foreground">
                        Sign in with the email you registered at the FMAA membership desk. If it&apos;s on
                        the approved list, premium unlocks automatically.
                      </div>
                    </div>
                  </div>
                  {me?.email && (
                    <div className="text-xs text-muted-foreground pl-8">
                      Signed in as <span className="font-mono">{me.email}</span>. If this isn&apos;t the
                      email you used at the membership desk, contact the FMAA committee.
                    </div>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>

        </div>
      </div>
    </Layout>
  );
}
