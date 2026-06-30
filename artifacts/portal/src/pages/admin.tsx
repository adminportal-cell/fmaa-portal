import { useState } from "react";
import { Link } from "wouter";
import { ShieldAlert, UserPlus } from "lucide-react";
import { format } from "date-fns";
import {
  useGetMe,
  useListMembers, useUpdateMember,
  useListApprovedMembers, useAddApprovedMembers, useDeleteApprovedMember,
  MemberRole, MembershipTier,
} from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";

import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { data: me, isLoading: meLoading } = useGetMe();
  
  if (meLoading) return <Layout><div className="p-8"><Skeleton className="h-[600px]" /></div></Layout>;
  
  if (!me?.isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 max-w-md text-center">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-serif font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-8">
            You don't have permission to access the admin console. This area is restricted to FMAA committee members.
          </p>
          <Button asChild>
            <Link href="/portal">Return to Dashboard</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-serif font-bold">Admin Console</h1>
          <p className="text-primary-foreground/80 mt-2">
            Manage member access and accounts. To edit content, visit the live pages (editing controls appear when you're signed in as admin).
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="approved" className="w-full">
          <TabsList className="mb-8 bg-muted/50 p-1">
            <TabsTrigger value="approved">Approved Emails</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="approved" className="space-y-6">
            <ApprovedMembersManager />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <MembersManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

/* ─── Approved Members Manager ────────────────────────────────────── */

function ApprovedMembersManager() {
  const { toast } = useToast();
  const { data: approved, isLoading } = useListApprovedMembers();
  const addEmails = useAddApprovedMembers();
  const deleteEmail = useDeleteApprovedMember();

  const [emailsInput, setEmailsInput] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailsInput.trim()) return;
    addEmails.mutate(
      { data: { emails: emailsInput } },
      {
        onSuccess: (res) => {
          toast({ title: "Saved ✓", description: `Added ${res.added} approved email${res.added === 1 ? "" : "s"}.` });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/approved-members"] });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
          setEmailsInput("");
        },
        onError: (err: Error) => {
          toast({ title: "Failed to add emails", description: err.message, variant: "destructive" });
        },
      },
    );
  };

  const handleRemove = (email: string) => {
    if (!confirm(`Remove ${email} from the approved list? Their account will be downgraded to Standard.`)) return;
    deleteEmail.mutate(
      { email },
      {
        onSuccess: () => {
          toast({ title: "Approved email removed" });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/approved-members"] });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grant Portal Access</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Member emails</Label>
              <Textarea
                required
                className="min-h-[140px] font-mono text-sm"
                placeholder={"alice@uni.edu.au\nbob@uni.edu.au, carol@uni.edu.au"}
                value={emailsInput}
                onChange={(e) => setEmailsInput(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={addEmails.isPending} className="min-w-[170px] gap-2 text-base font-semibold shadow-sm">
                <UserPlus className="w-4 h-4" />
                {addEmails.isPending ? "Saving..." : "Save & grant access"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approved Emails ({approved?.length ?? 0})</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            These email addresses will receive Premium membership automatically on sign-in.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approved?.map((row) => (
                  <TableRow key={row.email}>
                    <TableCell className="font-mono text-sm">{row.email}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(row.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemove(row.email)}
                        disabled={deleteEmail.isPending}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {approved?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No approved emails yet. Add some above to grant access.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Members Manager ─────────────────────────────────────────────── */

function MembersManager() {
  const { toast } = useToast();
  const { data: members, isLoading } = useListMembers();
  const updateMember = useUpdateMember();

  const handleRoleChange = (id: string, role: MemberRole) => {
    updateMember.mutate({ id, data: { role } }, {
      onSuccess: () => {
        toast({ title: "Role updated" });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
      },
    });
  };

  const handleTierChange = (id: string, tier: MembershipTier) => {
    updateMember.mutate({ id, data: { tier } }, {
      onSuccess: () => {
        toast({ title: "Tier updated" });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members ({members?.length ?? 0})</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">All signed-up portal members. Adjust roles and membership tiers here.</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.name || <span className="text-muted-foreground italic">No name</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{member.email}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(member.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={member.role}
                      onValueChange={(v) => handleRoleChange(member.id, v as MemberRole)}
                    >
                      <SelectTrigger className={`w-28 h-8 font-medium text-xs border-0 ${member.role === "admin" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-muted text-muted-foreground"}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={member.tier}
                      onValueChange={(v) => handleTierChange(member.id, v as MembershipTier)}
                    >
                      <SelectTrigger className={`w-28 h-8 font-medium text-xs border-0 ${member.tier === "premium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-muted text-muted-foreground"}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {members?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No members have signed up yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
        {members && members.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3 pt-4 border-t">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              {members.filter(m => m.tier === "premium").length} Premium
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              {members.filter(m => m.tier === "standard").length} Standard
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {members.filter(m => m.role === "admin").length} Admin
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
