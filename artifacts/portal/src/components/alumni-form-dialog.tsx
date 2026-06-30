import { useState, useEffect, useRef } from "react";
import {
  useCreateAlumni, useUpdateAlumni, AlumniProfile
} from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: AlumniProfile;
  onSuccess?: () => void;
}

const blank = () => ({
  name: "", role: "", company: "", industry: "",
  gradYear: new Date().getFullYear() - 1,
  insight: "", headshotUrl: "", linkedinUrl: "", location: "",
});

export function AlumniFormDialog({ open, onOpenChange, initial, onSuccess }: Props) {
  const { toast } = useToast();
  const createAlumni = useCreateAlumni();
  const updateAlumni = useUpdateAlumni();
  const isEdit = !!initial;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(blank());
  const [headshotPreview, setHeadshotPreview] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        role: initial.role,
        company: initial.company,
        industry: initial.industry,
        gradYear: initial.gradYear,
        insight: initial.insight,
        headshotUrl: initial.headshotUrl ?? "",
        linkedinUrl: initial.linkedinUrl ?? "",
        location: initial.location ?? "",
      });
      setHeadshotPreview(initial.headshotUrl ?? "");
    } else {
      setForm(blank());
      setHeadshotPreview("");
    }
  }, [initial, open]);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const processImage = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Please choose an image under 5 MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      set("headshotUrl", dataUrl);
      setHeadshotPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const clearHeadshot = () => {
    set("headshotUrl", "");
    setHeadshotPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      headshotUrl: form.headshotUrl || undefined,
      linkedinUrl: form.linkedinUrl || undefined,
      location: form.location || undefined,
      insight: form.insight || "",
    };
    if (isEdit) {
      updateAlumni.mutate({ id: initial!.id, data }, {
        onSuccess: () => {
          toast({ title: "Alumni profile updated" });
          queryClient.invalidateQueries({ queryKey: ["alumni"] });
          queryClient.invalidateQueries({ queryKey: ["/api/alumni"] });
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (err: Error) => toast({ title: "Failed to update", description: err.message, variant: "destructive" }),
      });
    } else {
      createAlumni.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "Alumni profile created" });
          queryClient.invalidateQueries({ queryKey: ["alumni"] });
          queryClient.invalidateQueries({ queryKey: ["/api/alumni"] });
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (err: Error) => toast({ title: "Failed to create", description: err.message, variant: "destructive" }),
      });
    }
  };

  const isPending = createAlumni.isPending || updateAlumni.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Alumni Profile" : "Add Alumni Profile"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">

          {/* Headshot upload */}
          <div className="space-y-2">
            <Label>Headshot <span className="text-muted-foreground text-xs">(optional — JPG, PNG, GIF, WebP, SVG)</span></Label>
            <div
              className={`flex items-center gap-4 rounded-md border-2 border-dashed p-2 -m-2 transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-transparent"}`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files?.[0]; if (f) processImage(f); }}
            >
              <Avatar className="h-20 w-20 border-2 border-border">
                <AvatarImage src={headshotPreview || undefined} className="object-cover" />
                <AvatarFallback className="text-2xl bg-muted">
                  {form.name ? form.name.charAt(0).toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/bmp,image/tiff"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {headshotPreview ? "Change photo" : "Upload photo"}
                </Button>
                {headshotPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={clearHeadshot}
                  >
                    <X className="w-4 h-4 mr-2" /> Remove
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">Max 5 MB — or drag &amp; drop here</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input required value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Job Title / Role</Label>
              <Input required value={form.role} onChange={e => set("role", e.target.value)} placeholder="e.g. Investment Banking Analyst" />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input required value={form.company} onChange={e => set("company", e.target.value)} placeholder="e.g. Goldman Sachs" />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input required value={form.industry} onChange={e => set("industry", e.target.value)} placeholder="e.g. Investment Banking" />
            </div>
            <div className="space-y-2">
              <Label>Graduation Year</Label>
              <Input type="number" required value={form.gradYear} onChange={e => set("gradYear", parseInt(e.target.value) || 2024)} />
            </div>
            <div className="space-y-2">
              <Label>University branch <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. UNSW, UniMelb" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Insight <span className="text-muted-foreground text-xs">(Career advice, story, tips — optional)</span></Label>
            <Textarea
              className="min-h-[200px]"
              value={form.insight}
              onChange={e => set("insight", e.target.value)}
              placeholder={"# Breaking into Investment Banking\n\nWrite their insight here..."}
            />
          </div>

          <div className="space-y-2">
            <Label>LinkedIn URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input value={form.linkedinUrl} onChange={e => set("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : isEdit ? "Save changes" : "Add to directory"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
