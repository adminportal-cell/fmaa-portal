import { useState, useEffect, useRef } from "react";
import {
  useCreateResource, useUpdateResource, Resource
} from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bold, Heading1, Heading2, Heading3, List, ListOrdered,
  Table as TableIcon, ImageIcon, Upload, FileText, Link as LinkIcon,
} from "lucide-react";

import { KNOWN_CATEGORIES } from "@/lib/categories";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Resource;
  defaultCategory?: string;
  defaultTag?: string;
  categories?: { value: string; label: string }[];
  onSuccess?: () => void;
}

const blank = (defaultCategory?: string, defaultTag?: string) => ({
  title: "",
  category: defaultCategory ?? "technical",
  summary: "",
  content: "",
  authorName: "FMAA",
  isPremium: false,
  coverImageUrl: "",
  fileUrl: "",
  readingMinutes: "" as string | number,
  tags: defaultTag ? [defaultTag] : [] as string[],
});

export function ResourceFormDialog({ open, onOpenChange, initial, defaultCategory, defaultTag, categories = KNOWN_CATEGORIES, onSuccess }: Props) {
  const { toast } = useToast();
  const createResource = useCreateResource();
  const updateResource = useUpdateResource();
  const isEdit = !!initial;

  const [form, setForm] = useState(blank(defaultCategory, defaultTag));
  const [customCategory, setCustomCategory] = useState("");
  const [contentMode, setContentMode] = useState<"write" | "upload">("write");
  const [coverMode, setCoverMode] = useState<"url" | "upload">("url");
  const [fileUrlMode, setFileUrlMode] = useState<"url" | "upload">("url");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedDownloadName, setUploadedDownloadName] = useState("");
  const [dragZone, setDragZone] = useState<string | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      if (initial) {
        const cat = initial.category as string;
        const isKnown = categories.some(c => c.value === cat && c.value !== "__custom__");
        setCustomCategory(isKnown ? "" : cat);
        setForm({
          title: initial.title,
          category: isKnown ? initial.category : "__custom__",
          summary: initial.summary,
          content: initial.content,
          authorName: initial.authorName,
          isPremium: initial.isPremium,
          coverImageUrl: initial.coverImageUrl ?? "",
          fileUrl: initial.fileUrl ?? "",
          readingMinutes: initial.readingMinutes ?? "",
          tags: initial.tags ?? [],
        });
        const hasUploadedFile = (initial.fileUrl ?? "").startsWith("data:");
        setContentMode(hasUploadedFile ? "upload" : "write");
        const hasUploadedCover = (initial.coverImageUrl ?? "").startsWith("data:");
        setCoverMode(hasUploadedCover ? "upload" : "url");
        setFileUrlMode(hasUploadedFile ? "upload" : "url");
        setUploadedDownloadName(hasUploadedFile ? "File attached" : "");
      } else {
        setForm(blank(defaultCategory, defaultTag));
        setCustomCategory("");
        setContentMode("write");
        setCoverMode("url");
        setFileUrlMode("url");
        setUploadedFileName("");
        setUploadedDownloadName("");
      }
    }
  }, [initial, open, defaultCategory, defaultTag]);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  function insertMarkdown(before: string, after = "", placeholder = "text") {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = form.content.slice(start, end) || placeholder;
    const newVal = form.content.slice(0, start) + before + selected + after + form.content.slice(end);
    set("content", newVal);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function insertAtLineStart(prefix: string) {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = form.content.lastIndexOf("\n", start - 1) + 1;
    const hasPrefix = form.content.slice(lineStart).startsWith(prefix);
    const newVal = hasPrefix
      ? form.content.slice(0, lineStart) + form.content.slice(lineStart + prefix.length)
      : form.content.slice(0, lineStart) + prefix + form.content.slice(lineStart);
    set("content", newVal);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + (hasPrefix ? -prefix.length : prefix.length), start + (hasPrefix ? -prefix.length : prefix.length));
    });
  }

  function insertTable() {
    const ta = contentRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const table = "\n\n| Heading 1 | Heading 2 | Heading 3 |\n| --- | --- | --- |\n| Cell | Cell | Cell |\n";
    const newVal = form.content.slice(0, pos) + table + form.content.slice(pos);
    set("content", newVal);
    requestAnimationFrame(() => { ta.focus(); });
  }

  function insertImageMarkdown() {
    insertMarkdown("![", "](https://)", "alt text");
  }

  function processContentFile(file: File) {
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large (max 20 MB)", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      set("fileUrl", reader.result as string);
      setUploadedFileName(file.name);
    };
    reader.readAsDataURL(file);
  }
  function handleContentFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processContentFile(file);
  }

  function processDownloadableFile(file: File) {
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large (max 20 MB)", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      set("fileUrl", reader.result as string);
      setUploadedDownloadName(file.name);
    };
    reader.readAsDataURL(file);
  }
  function handleDownloadableFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processDownloadableFile(file);
  }

  function processCoverFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large (max 5 MB)", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("coverImageUrl", reader.result as string);
    reader.readAsDataURL(file);
  }
  function handleCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processCoverFile(file);
  }

  function dropProps(zone: string, onFile: (f: File) => void) {
    return {
      onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragZone(zone); },
      onDragLeave: (e: React.DragEvent) => { e.preventDefault(); setDragZone(z => (z === zone ? null : z)); },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        setDragZone(null);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      },
    };
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveCategory = form.category === "__custom__" ? customCategory.trim() : form.category;
    if (form.category === "__custom__" && !customCategory.trim()) {
      toast({ title: "Please enter a category name", variant: "destructive" });
      return;
    }
    const readingMins = form.readingMinutes === "" ? undefined : Number(form.readingMinutes);
    const data = {
      title: form.title,
      category: effectiveCategory,
      summary: form.summary,
      content: form.content || " ",
      authorName: form.authorName,
      isPremium: form.isPremium,
      tags: form.tags.filter(Boolean),
      coverImageUrl: form.coverImageUrl || undefined,
      fileUrl: form.fileUrl || undefined,
      readingMinutes: readingMins,
    };
    if (isEdit) {
      updateResource.mutate({ id: initial!.id, data }, {
        onSuccess: () => {
          toast({ title: "Resource updated" });
          queryClient.invalidateQueries({ queryKey: ["resources"] });
          queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (err: Error) => toast({ title: "Failed to update", description: err.message, variant: "destructive" }),
      });
    } else {
      createResource.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "Resource created" });
          queryClient.invalidateQueries({ queryKey: ["resources"] });
          queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (err: Error) => toast({ title: "Failed to create", description: err.message, variant: "destructive" }),
      });
    }
  };

  const isPending = createResource.isPending || updateResource.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Resource" : "Add Resource"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input required value={form.title} onChange={e => set("title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.category === "__custom__" && (
                <Input
                  placeholder="e.g. Interview Prep"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Summary <span className="text-muted-foreground text-xs">(shown on cards)</span></Label>
            <Textarea required value={form.summary} onChange={e => set("summary", e.target.value)} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Content <span className="text-muted-foreground text-xs">(supports headings, bold, lists, tables)</span></Label>
              <div className="flex rounded-md border border-border overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setContentMode("write")}
                  className={`px-3 py-1 flex items-center gap-1.5 transition-colors ${contentMode === "write" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}
                >
                  <FileText className="w-3 h-3" /> Write
                </button>
                <button
                  type="button"
                  onClick={() => setContentMode("upload")}
                  className={`px-3 py-1 flex items-center gap-1.5 transition-colors ${contentMode === "upload" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}
                >
                  <Upload className="w-3 h-3" /> Upload file
                </button>
              </div>
            </div>

            {contentMode === "write" ? (
              <div className="border border-border rounded-md overflow-hidden">
                <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-muted/50 border-b border-border">
                  <ToolbarButton title="Bold" onClick={() => insertMarkdown("**", "**", "bold text")}>
                    <Bold className="w-3.5 h-3.5" />
                  </ToolbarButton>
                  <div className="w-px h-4 bg-border mx-0.5" />
                  <ToolbarButton title="Heading 1" onClick={() => insertAtLineStart("# ")}>
                    <Heading1 className="w-3.5 h-3.5" />
                  </ToolbarButton>
                  <ToolbarButton title="Heading 2" onClick={() => insertAtLineStart("## ")}>
                    <Heading2 className="w-3.5 h-3.5" />
                  </ToolbarButton>
                  <ToolbarButton title="Heading 3" onClick={() => insertAtLineStart("### ")}>
                    <Heading3 className="w-3.5 h-3.5" />
                  </ToolbarButton>
                  <div className="w-px h-4 bg-border mx-0.5" />
                  <ToolbarButton title="Bullet list" onClick={() => insertAtLineStart("- ")}>
                    <List className="w-3.5 h-3.5" />
                  </ToolbarButton>
                  <ToolbarButton title="Numbered list" onClick={() => insertAtLineStart("1. ")}>
                    <ListOrdered className="w-3.5 h-3.5" />
                  </ToolbarButton>
                  <div className="w-px h-4 bg-border mx-0.5" />
                  <ToolbarButton title="Table" onClick={insertTable}>
                    <TableIcon className="w-3.5 h-3.5" />
                  </ToolbarButton>
                  <ToolbarButton title="Image (by URL)" onClick={insertImageMarkdown}>
                    <ImageIcon className="w-3.5 h-3.5" />
                  </ToolbarButton>
                  <ToolbarButton title="Link" onClick={() => insertMarkdown("[", "](https://)", "link text")}>
                    <LinkIcon className="w-3.5 h-3.5" />
                  </ToolbarButton>
                </div>
                <Textarea
                  ref={contentRef}
                  className="min-h-[220px] font-mono text-sm border-0 rounded-none focus-visible:ring-0 resize-y"
                  value={form.content}
                  onChange={e => set("content", e.target.value)}
                  placeholder={"## Overview\n\nWrite your content here…\n\n- Bullet point\n- Another point\n\n**Bold text** and *italic text* supported."}
                />
              </div>
            ) : (
              <div className="border border-border rounded-md p-4 bg-muted/30 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Upload a PDF, Word document, or any other file. Members will be able to download it directly.
                </p>
                <label
                  {...dropProps("content", processContentFile)}
                  className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-md cursor-pointer transition-colors ${dragZone === "content" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}
                >
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {uploadedFileName || (form.fileUrl?.startsWith("data:") ? "File attached" : "Click to choose or drag and drop")}
                  </span>
                  <span className="text-xs text-muted-foreground">PDF, Word, Excel, PowerPoint — max 20 MB</span>
                  <input type="file" className="hidden" accept="*/*" onChange={handleContentFile} />
                </label>
                {(uploadedFileName || form.fileUrl?.startsWith("data:")) && (
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    File ready to upload
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Author Name</Label>
              <Input required value={form.authorName} onChange={e => set("authorName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Reading time <span className="text-muted-foreground text-xs">(minutes, optional)</span></Label>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 5"
                value={form.readingMinutes}
                onChange={e => set("readingMinutes", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Cover image <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <div className="flex rounded-md border border-border overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setCoverMode("url")}
                  className={`px-3 py-1 flex items-center gap-1.5 transition-colors ${coverMode === "url" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}
                >
                  <LinkIcon className="w-3 h-3" /> URL
                </button>
                <button
                  type="button"
                  onClick={() => setCoverMode("upload")}
                  className={`px-3 py-1 flex items-center gap-1.5 transition-colors ${coverMode === "upload" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}
                >
                  <Upload className="w-3 h-3" /> Upload
                </button>
              </div>
            </div>
            {coverMode === "url" ? (
              <Input
                value={form.coverImageUrl.startsWith("data:") ? "" : form.coverImageUrl}
                onChange={e => set("coverImageUrl", e.target.value)}
                placeholder="https://..."
              />
            ) : (
              <label
                {...dropProps("cover", processCoverFile)}
                className={`flex items-center gap-3 p-3 border border-dashed rounded-md cursor-pointer transition-colors ${dragZone === "cover" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
              >
                <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {form.coverImageUrl.startsWith("data:") ? "Image uploaded ✓" : "Click to upload or drag and drop"}
                </span>
                <input type="file" className="hidden" accept="image/*" onChange={handleCoverFile} />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Downloadable file <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <div className="flex rounded-md border border-border overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setFileUrlMode("url")}
                  className={`px-3 py-1 flex items-center gap-1.5 transition-colors ${fileUrlMode === "url" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}
                >
                  <LinkIcon className="w-3 h-3" /> URL
                </button>
                <button
                  type="button"
                  onClick={() => setFileUrlMode("upload")}
                  className={`px-3 py-1 flex items-center gap-1.5 transition-colors ${fileUrlMode === "upload" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}
                >
                  <Upload className="w-3 h-3" /> Upload
                </button>
              </div>
            </div>
            {fileUrlMode === "url" ? (
              <Input
                value={form.fileUrl.startsWith("data:") ? "" : form.fileUrl}
                onChange={e => set("fileUrl", e.target.value)}
                placeholder="https://..."
              />
            ) : (
              <label
                {...dropProps("download", processDownloadableFile)}
                className={`flex items-center gap-3 p-3 border border-dashed rounded-md cursor-pointer transition-colors ${dragZone === "download" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
              >
                <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {uploadedDownloadName || (form.fileUrl.startsWith("data:") ? "File attached" : "Click to upload or drag and drop")}
                </span>
                <input type="file" className="hidden" accept="*/*" onChange={handleDownloadableFile} />
              </label>
            )}
            {fileUrlMode === "upload" && (uploadedDownloadName || form.fileUrl.startsWith("data:")) && (
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                {uploadedDownloadName || "File ready"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tags <span className="text-muted-foreground text-xs">(comma-separated, used to categorise under technicals topics)</span></Label>
            <Input
              value={form.tags.join(", ")}
              onChange={e => set("tags", e.target.value.split(",").map(t => t.trim().toLowerCase()))}
              placeholder="e.g. accounting, dcf, modelling"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Checkbox id="premium" checked={form.isPremium} onCheckedChange={c => set("isPremium", !!c)} />
            <Label htmlFor="premium">Premium only <span className="text-muted-foreground text-xs font-normal">(locks content for non-premium members)</span></Label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : isEdit ? "Save changes" : "Create resource"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ToolbarButton({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="p-1.5 rounded hover:bg-muted transition-colors text-foreground/70 hover:text-foreground"
    >
      {children}
    </button>
  );
}
