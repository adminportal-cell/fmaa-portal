import { useState, type FormEvent } from "react";
import { SignUp } from "@clerk/clerk-react";
import { Link } from "wouter";
import { useCheckEmailApproved } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ShieldX } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function SignUpGate({ appearance }: { appearance?: object }) {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<"approved" | "denied" | null>(null);
  const checkEmail = useCheckEmailApproved();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    const res = await checkEmail.mutateAsync({ data: { email: trimmed } });
    setResult(res.approved ? "approved" : "denied");
  };

  if (result === "approved") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-muted/30 px-4 py-12">
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          signInUrl={`${basePath}/sign-in`}
          initialValues={{ emailAddress: email.trim() }}
          appearance={appearance}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md border border-border bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <img src={`${basePath}/logo.png`} alt="FMAA" className="h-10 w-auto" />
        </div>
        <h1 className="text-center text-2xl font-bold tracking-tight text-primary">
          Join FMAA Portal
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter your email to check your membership access
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            type="email"
            required
            placeholder="you@university.edu.au"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setResult(null);
            }}
            className="rounded-none"
            data-testid="input-signup-email"
          />
          {result === "denied" && (
            <div
              className="flex items-start gap-2 border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
              data-testid="text-signup-denied"
            >
              <ShieldX className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                This email isn&apos;t on the FMAA member list. Contact the FMAA team to
                request access, or try the email you registered with.
              </span>
            </div>
          )}
          <Button
            type="submit"
            className="w-full rounded-none font-semibold tracking-wide"
            disabled={checkEmail.isPending}
            data-testid="button-signup-continue"
          >
            <Mail className="mr-2 h-4 w-4" />
            {checkEmail.isPending ? "Checking…" : "Continue"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-primary underline hover:text-primary/80"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
