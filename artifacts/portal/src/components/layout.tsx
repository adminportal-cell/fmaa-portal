import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useGetMe } from "@workspace/api-client-react";
import { LogOut, User, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const { data: me } = useGetMe();

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  const navItems = [
    { label: "Home", path: "/portal" },
    { label: "Resources", path: "/resources" },
    { label: "Technicals", path: "/technicals" },
    { label: "Alumni", path: "/alumni" },
  ];

  if (me?.isAdmin) {
    navItems.push({ label: "Admin", path: "/admin" });
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-white supports-[backdrop-filter]:bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/portal" className="flex items-center transition-opacity hover:opacity-80">
              <img src={`${basePath}/logo.png`} alt="FMAA" className="h-12 w-auto" />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.startsWith(item.path)
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={me?.avatarUrl || clerkUser?.imageUrl} alt={me?.name || ""} />
                    <AvatarFallback className="bg-primary/5 text-primary font-medium">
                      {(me?.name || clerkUser?.firstName || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{me?.name || clerkUser?.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {me?.email || clerkUser?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    {me?.isPremium ? (
                      <Crown className="w-4 h-4 text-primary" />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">
                      {me?.isPremium ? "Premium Member" : "Standard Member"}
                    </span>
                  </div>
                  {me?.isAdmin && (
                    <div className="flex items-center gap-2 mt-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Administrator</span>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => signOut({ redirectUrl: basePath || "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
      
      <footer className="border-t bg-muted/40 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Finance and Management Association of Australia.</p>
        </div>
      </footer>
    </div>
  );
}
