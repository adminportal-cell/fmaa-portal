import { Link } from "wouter";
import { ArrowRight, BookOpen, Users, FileText, Lock, ExternalLink, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

import heroBg from "@/assets/images/hero-bg.png";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary/15">
      <header className="sticky top-0 z-50 w-full bg-white border-b border-border">
        <div className="container mx-auto px-6 h-28 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src={`${basePath}/logo.png`} alt="FMAA" className="h-24 w-auto" />
            <span className="hidden sm:inline text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground border-l border-border pl-3">
              Premium Portal
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none h-11 px-6 font-medium">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src={heroBg} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-primary/80" />
          </div>

          <div className="relative z-10 container mx-auto px-6 py-28 md:py-40">
            <div className="max-w-3xl">
              <p className="text-white/70 text-xs font-semibold tracking-[0.3em] uppercase mb-6">
                Premium &middot; FMAA Members
              </p>
              <h1 className="font-sans text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-8">
                FMAA Members Portal
              </h1>
              <p className="text-base md:text-lg text-white/85 mb-10 max-w-2xl leading-relaxed">
                The members-only resource hub for FMAA Premium members. CV templates, alumni
                insights, exclusive recruiting content and technicals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90 rounded-none h-12 px-8 text-sm font-semibold tracking-wide">
                  <Link href="/sign-in">
                    Sign in to the portal <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-none h-12 px-8 text-sm font-semibold tracking-wide bg-transparent text-white border-white/60 hover:bg-white hover:text-primary">
                  <a href="https://www.fmaa.com.au/" target="_blank" rel="noopener noreferrer">
                    Visit fmaa.com.au <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* What Premium unlocks */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mb-16">
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-4">
                Inside the portal
              </p>
              <h2 className="font-sans text-3xl md:text-5xl font-bold text-primary leading-[1.1]">
                Career resources for FMAA Premium members
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-px bg-border">
              {[
                {
                  icon: FileText,
                  title: "CV and Cover Letter resources",
                  body: "Resumes and Cover Letter templates from FMAA alumni who received offers at bulge bracket banks, MBB and top buy-side firms",
                },
                {
                  icon: Users,
                  title: "Alumni insights by industry",
                  body: "First-hand notes from alumni across Investment Banking, Asset Management, Consulting and Professional Services, covering application timelines, interview style and team culture.",
                },
                {
                  icon: BookOpen,
                  title: "Technical Resources",
                  body: "Technical guides covering Accounting, Valuation, M&A and Excel modelling.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="bg-background p-10 hover:bg-secondary/30 transition-colors">
                  <Icon className="h-7 w-7 text-primary mb-6" strokeWidth={1.5} />
                  <h3 className="text-lg font-semibold mb-3 text-primary">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Standard vs Portal positioning */}
        <section className="py-24 bg-secondary/40 border-y border-border">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="mb-12">
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-4">
                Membership types
              </p>
              <h2 className="font-sans text-3xl md:text-5xl font-bold text-primary leading-[1.1] max-w-3xl">
                Standard membership and the Premium portal
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-border p-10">
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-6">
                  Standard FMAA Membership
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                  Included with general FMAA membership. Information and sign-ups are on the main FMAA website.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    { icon: Calendar, text: "Keynote and sponsor events" },
                    { icon: Mail, text: "Weekly newsletter" },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-3 text-foreground text-sm">
                      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" strokeWidth={1.75} />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="https://www.fmaa.com.au/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm font-semibold inline-flex items-center hover:underline"
                >
                  Visit fmaa.com.au <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </a>
              </div>

              <div className="bg-primary text-primary-foreground p-10 border border-primary">
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60 mb-6">
                  Premium &middot; This Portal
                </p>
                <p className="text-white/80 text-sm leading-relaxed mb-8">
                  Gated career resources for members preparing for competitive recruiting.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "CV & cover letter resources",
                    "Alumni insights across industries",
                    "Exclusive recruiting content",
                    "Technicals & interview prep",
                  ].map((text) => (
                    <li key={text} className="flex items-start gap-3 text-white text-sm">
                      <Lock className="h-4 w-4 mt-0.5 flex-shrink-0 text-white/70" strokeWidth={1.75} />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-in"
                  className="text-white text-sm font-semibold inline-flex items-center hover:underline"
                >
                  Sign in to the portal <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mt-10 max-w-3xl">
              Premium access is granted by the committee. If you believe you should have access,
              please contact your branch committee.
            </p>
          </div>
        </section>
      </main>

      <footer className="py-10 bg-background border-t border-border">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <img src={`${basePath}/logo.png`} alt="FMAA" className="h-8 w-auto opacity-70" />
            <span>&copy; {new Date().getFullYear()} Financial Management Association of Australia.</span>
          </div>
          <div className="flex gap-8">
            <a href="https://www.fmaa.com.au/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Main website
            </a>
            <Link href="/sign-in" className="hover:text-primary transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
