import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, SignedIn, SignedOut, useClerk } from "@clerk/clerk-react";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import Portal from "@/pages/portal";
import ResourcesList from "@/pages/resources";
import ResourceDetail from "@/pages/resources/detail";
import AlumniList from "@/pages/alumni";
import AlumniDetail from "@/pages/alumni/detail";
import Upgrade from "@/pages/upgrade";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.png`,
  },
  variables: {
    colorPrimary: "hsl(215 30% 17%)",
    colorForeground: "hsl(215 30% 17%)",
    colorMutedForeground: "hsl(215 14% 42%)",
    colorDanger: "hsl(0 72% 51%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(214 20% 90%)",
    colorInputForeground: "hsl(215 30% 17%)",
    colorNeutral: "hsl(214 20% 90%)",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0.25rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-none w-[440px] max-w-full overflow-hidden border border-border",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-2xl font-bold tracking-tight text-primary",
    headerSubtitle: "text-muted-foreground text-sm",
    socialButtonsBlockButtonText: "text-foreground font-medium",
    formFieldLabel: "text-foreground font-medium text-sm",
    footerActionLink: "text-primary hover:text-primary/80 font-semibold underline",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground text-xs uppercase tracking-wider",
    identityPreviewEditButton: "text-primary hover:text-primary/80",
    formFieldSuccessText: "text-green-600 text-sm",
    alertText: "text-destructive text-sm",
    logoBox: "mb-6 flex justify-center",
    logoImage: "h-8 w-auto",
    socialButtonsBlockButton: "border-border rounded-none hover:bg-secondary transition-colors",
    formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-none transition-colors font-semibold tracking-wide",
    formFieldInput: "border-border rounded-none bg-background text-foreground focus:ring-2 focus:ring-ring",
    footerAction: "bg-secondary/40 pb-6",
    dividerLine: "bg-border",
    alert: "bg-destructive/10 border-destructive/20 text-destructive rounded-none",
    otpCodeFieldInput: "border-border rounded-none bg-background text-foreground focus:ring-2 focus:ring-ring",
    formFieldRow: "mb-4",
    main: "px-8 py-6",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/30 px-4 py-12">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/30 px-4 py-12">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <SignedIn>
        <Redirect to="/portal" />
      </SignedIn>
      <SignedOut>
        <Home />
      </SignedOut>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Sign in to FMAA",
            subtitle: "Access the portal",
          },
        },
        signUp: {
          start: {
            title: "Join FMAA",
            subtitle: "Start your career journey today",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          
          <Route path="/portal">
            <SignedIn><Portal /></SignedIn>
            <SignedOut><Redirect to="/sign-in" /></SignedOut>
          </Route>
          
          <Route path="/resources">
            <SignedIn><ResourcesList /></SignedIn>
            <SignedOut><Redirect to="/sign-in" /></SignedOut>
          </Route>
          
          <Route path="/resources/:id">
            <SignedIn><ResourceDetail /></SignedIn>
            <SignedOut><Redirect to="/sign-in" /></SignedOut>
          </Route>
          
          <Route path="/alumni">
            <SignedIn><AlumniList /></SignedIn>
            <SignedOut><Redirect to="/sign-in" /></SignedOut>
          </Route>
          
          <Route path="/alumni/:id">
            <SignedIn><AlumniDetail /></SignedIn>
            <SignedOut><Redirect to="/sign-in" /></SignedOut>
          </Route>
          
          <Route path="/upgrade">
            <SignedIn><Upgrade /></SignedIn>
            <SignedOut><Redirect to="/sign-in" /></SignedOut>
          </Route>

          <Route path="/admin">
            <SignedIn><Admin /></SignedIn>
            <SignedOut><Redirect to="/sign-in" /></SignedOut>
          </Route>

          <Route component={NotFound} />
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <TooltipProvider>
        <ClerkProviderWithRoutes />
        <Toaster />
      </TooltipProvider>
    </WouterRouter>
  );
}

export default App;
