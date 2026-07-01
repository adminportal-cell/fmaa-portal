export const KNOWN_CATEGORIES = [
  { value: "cv", label: "CV Template" },
  { value: "cover_letter", label: "Cover Letter" },
  { value: "technical", label: "Technical Guide" },
  { value: "recruiting", label: "Recruiting" },
  { value: "alumni_insight", label: "Alumni Insight" },
  { value: "behavioural_guide", label: "Behavioural Guide" },
  { value: "__custom__", label: "Custom…" },
];

export const TECHNICAL_CATEGORIES = [
  { value: "accounting", label: "Accounting" },
  { value: "valuation", label: "Valuation" },
  { value: "m&a", label: "M&A" },
  { value: "excel", label: "Excel" },
  { value: "miscellaneous", label: "Miscellaneous" },
];

// Single source of truth for which resource categories belong to the Technicals
// section. These never appear in the general Resource Library — only under their
// matching Technicals topic tile.
export const TECHNICAL_CATEGORY_VALUES = [
  "accounting",
  "valuation",
  "m&a",
  "excel",
  "miscellaneous",
];

export function isTechnicalCategory(category: string): boolean {
  return TECHNICAL_CATEGORY_VALUES.includes(category);
}

// Human-readable labels for every resource/technical category. Used to render
// category badges consistently (capitalised, no underscores) across the portal.
export const CATEGORY_LABELS: Record<string, string> = {
  cv: "CV Templates",
  cover_letter: "Cover Letters",
  alumni_insight: "Alumni Insights",
  technical: "Technical Guides",
  recruiting: "Recruiting Tips",
  behavioural_guide: "Behavioural Guides",
  accounting: "Accounting",
  valuation: "Valuation",
  "m&a": "M&A",
  excel: "Excel",
  miscellaneous: "Miscellaneous",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

// Shared Tailwind classes for the "Premium" badge — amber/yellow to match the
// admin tier badge.
export const PREMIUM_BADGE_CLASS =
  "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400";
