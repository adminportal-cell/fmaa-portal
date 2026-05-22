import { useState } from "react";
import { Link } from "wouter";
import { ShieldAlert, Plus, Trash2, Edit, Save, X, MoreHorizontal, UserCog } from "lucide-react";
import { format } from "date-fns";
import {
  useGetMe,
  useListResources, useCreateResource, useUpdateResource, useDeleteResource,
  useListAlumni, useCreateAlumni, useUpdateAlumni, useDeleteAlumni,
  useListMembers, useUpdateMember,
  useListApprovedMembers, useAddApprovedMembers, useDeleteApprovedMember,
  ResourceCategory, MemberRole, MembershipTier
} from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";

import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Forms would normally use react-hook-form + zod here, but for brevity in this admin view we'll use state
// since it's a comprehensive CRUD interface. In a full production app, each form would be its own component.

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
          <p className="text-primary-foreground/80 mt-2">Manage resources, alumni profiles, and members.</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="resources" className="w-full">
          <TabsList className="mb-8 bg-muted/50 p-1">
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="alumni">Alumni</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="approved">Approved Emails</TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="space-y-6">
            <ResourcesManager />
          </TabsContent>

          <TabsContent value="alumni" className="space-y-6">
            <AlumniManager />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <MembersManager />
          </TabsContent>

          <TabsContent value="approved" className="space-y-6">
            <ApprovedMembersManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function ResourcesManager() {
  const { toast } = useToast();
  const { data: resources, isLoading } = useListResources();
  const createResource = useCreateResource();
  const deleteResource = useDeleteResource();
  
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "", slug: "", category: "technical" as ResourceCategory, 
    summary: "", content: "", authorName: "", isPremium: false,
    coverImageUrl: "", fileUrl: "", readingMinutes: 5
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createResource.mutate({ data: formData }, {
      onSuccess: () => {
        toast({ title: "Resource created successfully" });
        queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
        setIsOpen(false);
        setFormData({
          title: "", slug: "", category: "technical", summary: "", content: "", 
          authorName: "", isPremium: false, coverImageUrl: "", fileUrl: "", readingMinutes: 5
        });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      deleteResource.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Resource deleted" });
          queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
        }
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Resource Library</CardTitle>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Resource</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Resource</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v as ResourceCategory})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cv">CV</SelectItem>
                      <SelectItem value="cover_letter">Cover Letter</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="recruiting">Recruiting</SelectItem>
                      <SelectItem value="alumni_insight">Insight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Summary (Short description)</Label>
                <Textarea required value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Content (Markdown)</Label>
                <Textarea required className="min-h-[200px] font-mono text-sm" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Author Name</Label>
                  <Input required value={formData.authorName} onChange={e => setFormData({...formData, authorName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Reading Minutes</Label>
                  <Input type="number" required value={formData.readingMinutes} onChange={e => setFormData({...formData, readingMinutes: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <Label>Cover Image URL (Optional)</Label>
                  <Input value={formData.coverImageUrl} onChange={e => setFormData({...formData, coverImageUrl: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>File URL (Optional)</Label>
                  <Input value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="premium" checked={formData.isPremium} onCheckedChange={c => setFormData({...formData, isPremium: !!c})} />
                <Label htmlFor="premium" className="font-semibold text-accent">Premium Resource (Lock content)</Label>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={createResource.isPending}>
                  {createResource.isPending ? "Saving..." : "Create Resource"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-64" /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources?.map(resource => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">{resource.title}</TableCell>
                  <TableCell><Badge variant="outline">{resource.category}</Badge></TableCell>
                  <TableCell>
                    {resource.isPremium ? <Badge className="bg-accent/20 text-accent hover:bg-accent/20">Premium</Badge> : <Badge variant="secondary">Free</Badge>}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{format(new Date(resource.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(resource.id)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {resources?.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No resources found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function AlumniManager() {
  const { toast } = useToast();
  const { data: alumni, isLoading } = useListAlumni();
  const createAlumni = useCreateAlumni();
  const deleteAlumni = useDeleteAlumni();
  
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "", role: "", company: "", industry: "Investment Banking", 
    gradYear: 2024, insight: "", headshotUrl: "", linkedinUrl: "", location: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAlumni.mutate({ data: formData }, {
      onSuccess: () => {
        toast({ title: "Alumni created successfully" });
        queryClient.invalidateQueries({ queryKey: ["/api/alumni"] });
        setIsOpen(false);
        setFormData({
          name: "", role: "", company: "", industry: "Investment Banking", 
          gradYear: 2024, insight: "", headshotUrl: "", linkedinUrl: "", location: ""
        });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this profile?")) {
      deleteAlumni.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Profile deleted" });
          queryClient.invalidateQueries({ queryKey: ["/api/alumni"] });
        }
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Alumni Directory</CardTitle>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Alumni</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Alumni Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input required value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Graduation Year</Label>
                  <Input type="number" required value={formData.gradYear} onChange={e => setFormData({...formData, gradYear: parseInt(e.target.value) || 2020})} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Insight (Markdown)</Label>
                <Textarea required className="min-h-[150px]" value={formData.insight} onChange={e => setFormData({...formData, insight: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Headshot URL (Optional)</Label>
                  <Input value={formData.headshotUrl} onChange={e => setFormData({...formData, headshotUrl: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn URL (Optional)</Label>
                  <Input value={formData.linkedinUrl} onChange={e => setFormData({...formData, linkedinUrl: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={createAlumni.isPending}>
                  {createAlumni.isPending ? "Saving..." : "Create Profile"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-64" /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role & Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alumni?.map(profile => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.name}</TableCell>
                  <TableCell>
                    {profile.role} <span className="text-muted-foreground">at</span> {profile.company}
                  </TableCell>
                  <TableCell><Badge variant="outline">{profile.industry}</Badge></TableCell>
                  <TableCell>{profile.gradYear}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(profile.id)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {alumni?.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No alumni found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function ApprovedMembersManager() {
  const { toast } = useToast();
  const { data: approved, isLoading } = useListApprovedMembers();
  const addEmails = useAddApprovedMembers();
  const deleteEmail = useDeleteApprovedMember();

  const [emailsInput, setEmailsInput] = useState("");
  const [note, setNote] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailsInput.trim()) return;
    addEmails.mutate(
      { data: { emails: emailsInput, note: note || undefined } },
      {
        onSuccess: (res) => {
          toast({ title: `Added ${res.added} approved email${res.added === 1 ? "" : "s"}` });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/approved-members"] });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
          setEmailsInput("");
          setNote("");
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
          <CardTitle>Add Approved Emails</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Paste one or more emails (separated by commas, spaces or new lines).
            Anyone who signs in with an email on this list automatically gets Premium access.
          </p>
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
            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Input
                placeholder="e.g. 2026 S1 paid intake"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={addEmails.isPending}>
                {addEmails.isPending ? "Adding..." : "Add to approved list"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approved Member Emails ({approved?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Added by</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approved?.map((row) => (
                  <TableRow key={row.email}>
                    <TableCell className="font-mono text-sm">{row.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.note ?? "-"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.addedBy ?? "-"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(row.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(row.email)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {approved?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No approved emails yet. Paste some above to start verifying members.
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

function MembersManager() {
  const { toast } = useToast();
  const { data: members, isLoading } = useListMembers();
  const updateMember = useUpdateMember();

  const handleRoleChange = (id: string, role: MemberRole) => {
    updateMember.mutate({ id, data: { role } }, {
      onSuccess: () => {
        toast({ title: "Member role updated" });
        queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      }
    });
  };

  const handleTierChange = (id: string, tier: MembershipTier) => {
    updateMember.mutate({ id, data: { tier } }, {
      onSuccess: () => {
        toast({ title: "Membership tier updated" });
        queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Directory</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-64" /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name / Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map(member => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.email}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(member.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Select value={member.role} onValueChange={v => handleRoleChange(member.id, v as MemberRole)}>
                      <SelectTrigger className="h-8 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={member.tier} onValueChange={v => handleTierChange(member.id, v as MembershipTier)}>
                      <SelectTrigger className="h-8 w-32">
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
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No members found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
