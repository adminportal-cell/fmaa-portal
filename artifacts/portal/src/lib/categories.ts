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
