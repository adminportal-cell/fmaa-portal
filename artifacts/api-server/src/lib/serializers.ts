import type { User, Resource, AlumniProfile } from "@workspace/db";

export function toMe(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tier: user.tier,
    isPremium: user.tier === "premium" || user.role === "admin",
    isAdmin: user.role === "admin",
    avatarUrl: user.avatarUrl ?? null,
  };
}

export function toMember(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tier: user.tier,
    createdAt: user.createdAt.toISOString(),
  };
}

export function toResource(r: Resource, opts?: { canAccessPremium?: boolean; includeContent?: boolean }) {
  const locked = r.isPremium && opts?.canAccessPremium === false;
  const includeContent = opts?.includeContent ?? true;
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    category: r.category,
    summary: r.summary,
    content: locked || !includeContent ? "" : r.content,
    tags: r.tags ?? [],
    fileUrl: locked ? null : r.fileUrl ?? null,
    coverImageUrl: r.coverImageUrl ?? null,
    readingMinutes: r.readingMinutes ?? null,
    isPremium: r.isPremium,
    locked,
    authorName: r.authorName,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export function toAlumni(a: AlumniProfile) {
  return {
    id: a.id,
    name: a.name,
    role: a.role,
    company: a.company,
    industry: a.industry,
    gradYear: a.gradYear,
    insight: a.insight,
    headshotUrl: a.headshotUrl ?? null,
    linkedinUrl: a.linkedinUrl ?? null,
    location: a.location ?? null,
    createdAt: a.createdAt.toISOString(),
  };
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
