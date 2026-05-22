import { db, resourcesTable, alumniProfilesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const resources = [
  {
    slug: "cv-banking-template",
    title: "Investment Banking CV — Two-Page Template",
    category: "cv",
    summary:
      "The exact two-page CV format used by FMAA grads placed into bulge-bracket summer programs.",
    content: `# Investment Banking CV Template

This template reflects what bulge-bracket and elite boutique recruiters expect from a first-year applicant in Australia.

## Layout rules
- Strict one-page in first year, two pages from penultimate year.
- 10.5pt Garamond or 10pt Calibri. Margins 1.5cm all round.
- Five sections only: Header, Education, Experience, Leadership, Skills & Interests.

## Header
Name in 14pt bold. Below it: phone, professional email (firstname.lastname@gmail.com), LinkedIn URL, city of residence. Nothing else — no photo, no DOB.

## Education
- University, degree, major, expected graduation, WAM.
- Add 1–2 sub-bullets only if relevant: HD subjects, scholarships, exchange.

## Experience
Reverse chronological. Each entry: 3–5 bullets in CAR format (context → action → result). Lead with a verb, quantify everything you can.

## Leadership
FMAA, case comps, student societies. Treat them with the same gravity as work — recruiters do.

## Skills & Interests
One line for technical (Excel, PowerPoint, Bloomberg, Python). One line for languages. One line for genuine interests with a specific anchor.

## What gets you cut
- Objective statements
- Hobbies without specifics
- More than two pages
- Inconsistent date formatting
- Any typo, ever`,
    tags: ["cv", "banking", "template"],
    readingMinutes: 8,
    isPremium: true,
    authorName: "FMAA Careers",
  },
  {
    slug: "cover-letter-consulting",
    title: "Consulting Cover Letter — Structure That Wins",
    category: "cover_letter",
    summary:
      "Four-paragraph structure for MBB and Tier 2 consulting applications, with two annotated examples.",
    content: `# Consulting Cover Letter

Consulting firms read your cover letter to test communication, not creativity. The format is rigid for a reason.

## The four paragraphs
1. **Hook** — why this firm, this office, this practice. Be specific.
2. **Why you fit** — one concrete project or experience demonstrating structured thinking.
3. **Why now** — what you'll bring to their next study.
4. **Close** — confident, single line, request next steps.

## Common mistakes
- Recycling the same letter across firms
- Listing skills instead of demonstrating them
- Going over one page
- Apologising for a non-traditional background — own it instead`,
    tags: ["cover_letter", "consulting"],
    readingMinutes: 6,
    isPremium: true,
    authorName: "FMAA Careers",
  },
  {
    slug: "cover-letter-big4",
    title: "Big 4 Cover Letter Starter",
    category: "cover_letter",
    summary:
      "Free starter template for Big 4 audit, consulting and tax graduate applications.",
    content: `# Big 4 Cover Letter Starter

The Big 4 graduate process is volume-driven. Your letter needs to clear the screen in 20 seconds.

## Opening line
Avoid "I am writing to apply for...". Open with a single sentence on why you want this specific service line.

## Body
One paragraph on academic background, one on leadership, one on a specific Big 4 differentiator (tech investment, ESG practice, the partner who spoke at FMAA last semester).

## Closing
Signal flexibility on start date and location. Mention any preferences only if they match what the firm is hiring for.`,
    tags: ["cover_letter", "big4"],
    readingMinutes: 5,
    isPremium: false,
    authorName: "FMAA Careers",
  },
  {
    slug: "alumni-insight-ib-sydney",
    title: "Inside the Sydney IB Summer Program",
    category: "alumni_insight",
    summary:
      "What an FMAA alum learned during a 10-week M&A summer at a bulge-bracket Sydney desk.",
    content: `# Inside the Sydney IB Summer Program

Notes from an FMAA member who spent last summer as an M&A intern in Sydney.

## Week 1–2: Training
Two weeks of accounting, modelling and PowerPoint bootcamp. The shortcut keys you learned at FMAA technicals night will save you here.

## Week 3–6: Live deal
Onboarded onto a mid-market deal Friday of week two. Built the operating model from scratch by week four, with three rounds of MD review. Bring a notebook to every meeting — written notes still beat laptops on the desk.

## Week 7–10: Conversion
Conversion conversations begin earlier than you think. Have a one-pager on what you've delivered ready by week six.

## What I'd do differently
- Skill up on PowerPoint before day one — modelling is teachable, deck speed is not.
- Ask analysts how they want comments delivered (Slack vs email vs walk-over) on day one.
- Never go home before your staffer.`,
    tags: ["alumni", "banking", "internship"],
    readingMinutes: 7,
    isPremium: true,
    authorName: "FMAA Alumni Network",
  },
  {
    slug: "technical-dcf-walkthrough",
    title: "DCF Walkthrough for Interviews",
    category: "technical",
    summary:
      "The exact DCF answer recruiters want to hear, broken into a 90-second story.",
    content: `# DCF Walkthrough — 90 Seconds

The DCF question is asked in 80% of finance interviews. Memorise this structure.

## The story
1. Project unlevered free cash flow for 5–10 years.
2. Discount each year to present value at WACC.
3. Calculate terminal value (Gordon Growth or exit multiple).
4. Discount terminal value back to present.
5. Sum: enterprise value.
6. Subtract net debt to get equity value, divide by shares to get per-share value.

## Common follow-ups
- "How do you calculate WACC?" — weighted cost of equity (CAPM) and after-tax cost of debt.
- "Which terminal value method do you prefer and why?"
- "What's the biggest weakness of a DCF?" — terminal value sensitivity, garbage-in-garbage-out assumptions.

## Trap question
"If WACC and terminal growth are equal, what happens?" — Gordon Growth formula breaks (division by zero).`,
    tags: ["technical", "valuation", "interview"],
    readingMinutes: 6,
    isPremium: true,
    authorName: "FMAA Technicals",
  },
  {
    slug: "technical-three-statements",
    title: "Linking the Three Financial Statements",
    category: "technical",
    summary:
      "If depreciation goes up by $10 — the most common technical question in any finance interview.",
    content: `# The Three-Statement Question

"Walk me through what happens if depreciation increases by $10."

## Income statement
EBIT drops by $10. Assuming a 30% tax rate, net income drops by $7.

## Cash flow statement
Start with net income (-$7). Add back depreciation (+$10). Cash from operations is up $3.

## Balance sheet
Cash is up $3 (assets). PP&E is down $10 (assets). Net assets down $7. Retained earnings down $7 (equity). Balances.

## Why it's asked
Tests whether you understand the statements as a system, not three disconnected things.`,
    tags: ["technical", "accounting"],
    readingMinutes: 5,
    isPremium: false,
    authorName: "FMAA Technicals",
  },
  {
    slug: "recruiting-timeline-2026",
    title: "2026 Recruiting Timeline (Australia)",
    category: "recruiting",
    summary:
      "Month-by-month recruiting calendar for IB, consulting, Big 4 and corporate grad programs in Australia.",
    content: `# 2026 Recruiting Timeline

## February–March
- IB summer applications open (apply day one — rolling)
- Insight programs across consulting

## April–May
- IB summer assessment centres
- Consulting first-round interviews

## July
- Big 4 graduate applications open

## August–September
- Big 4 assessment centres
- Corporate finance grad programs (CBA, ANZ, NAB)

## October–November
- Boutique IB / equity research applications
- Buy-side rotational programs

Plan backwards from these dates. CV polish should be done by January.`,
    tags: ["recruiting", "timeline"],
    readingMinutes: 4,
    isPremium: false,
    authorName: "FMAA Careers",
  },
  {
    slug: "recruiting-networking-coffee-chats",
    title: "Networking Coffee Chats That Convert",
    category: "recruiting",
    summary:
      "Members-only playbook: how to land, run, and follow up on the coffee chats that move you from CV to interview.",
    content: `# Networking Coffee Chats That Convert

The hidden curriculum of recruiting in Australia. Most offers come through warm intros.

## The ask
Send a three-sentence LinkedIn message. Reference a specific reason (alma mater, mutual connection, a recent deal). Ask for 15 minutes. Never attach your CV in the first message.

## The chat
- Have three substantive questions ready
- Spend 80% of the meeting listening
- Close with one specific ask: a name, a resource, or a follow-up

## The follow-up
- Thank-you note within 24 hours referencing one specific thing they said
- Six weeks later: a one-line update on how you actioned their advice
- Six months later: an update worth their time

## What kills the relationship
- Vague asks ("can I pick your brain")
- Forgetting to follow through
- Asking for a referral on the first chat`,
    tags: ["recruiting", "networking"],
    readingMinutes: 7,
    isPremium: true,
    authorName: "FMAA Careers",
  },
];

const alumni = [
  {
    name: "Hannah Cheng",
    role: "Investment Banking Analyst",
    company: "Goldman Sachs",
    industry: "Investment Banking",
    gradYear: 2023,
    insight:
      "The grad who differentiates themselves is the one who knows what's happening in the market this week — not the one with the highest WAM. Read the AFR every morning.",
    location: "Sydney",
    linkedinUrl: "https://www.linkedin.com/in/example-hannah",
  },
  {
    name: "Marcus Tindall",
    role: "Strategy Consultant",
    company: "Bain & Company",
    industry: "Consulting",
    gradYear: 2022,
    insight:
      "Case prep is necessary but overrated. Spend equal time on fit interviews — they're where most offers are won or lost in the Sydney office.",
    location: "Sydney",
    linkedinUrl: "https://www.linkedin.com/in/example-marcus",
  },
  {
    name: "Priya Suresh",
    role: "Audit Senior",
    company: "Deloitte",
    industry: "Professional Services",
    gradYear: 2021,
    insight:
      "Big 4 audit gives you a license to ask any executive any question for three years. Use it. The accounting comes second to that access.",
    location: "Melbourne",
    linkedinUrl: "https://www.linkedin.com/in/example-priya",
  },
  {
    name: "Daniel O'Connor",
    role: "Equity Research Associate",
    company: "Macquarie",
    industry: "Asset Management",
    gradYear: 2020,
    insight:
      "Buy-side roles want you to have a view. Sell-side wants you to have a model. Pick the side of the street that matches your wiring before you apply.",
    location: "Sydney",
    linkedinUrl: "https://www.linkedin.com/in/example-daniel",
  },
  {
    name: "Sophie Lange",
    role: "Senior Manager — Corporate Strategy",
    company: "Commonwealth Bank of Australia",
    industry: "Corporate Finance",
    gradYear: 2018,
    insight:
      "Five years in, the people getting promoted are the ones who can run a meeting and write a board paper — not the ones with the best technical chops.",
    location: "Sydney",
  },
  {
    name: "Ahmed Rahman",
    role: "Private Equity Associate",
    company: "Pacific Equity Partners",
    industry: "Private Equity",
    gradYear: 2019,
    insight:
      "PE recruiting in Australia is small and reputational. Do two years in IB or top-tier consulting first, and treat every analyst you meet as a future colleague.",
    location: "Sydney",
    linkedinUrl: "https://www.linkedin.com/in/example-ahmed",
  },
];

async function main(): Promise<void> {
  const [{ rc }] = (await db.execute(
    sql`SELECT count(*)::int AS rc FROM resources`,
  )).rows as Array<{ rc: number }>;

  if (rc > 0) {
    console.log(`Resources table already has ${rc} rows — skipping resource seed.`);
  } else {
    await db.insert(resourcesTable).values(resources);
    console.log(`Seeded ${resources.length} resources.`);
  }

  const [{ ac }] = (await db.execute(
    sql`SELECT count(*)::int AS ac FROM alumni_profiles`,
  )).rows as Array<{ ac: number }>;

  if (ac > 0) {
    console.log(`Alumni table already has ${ac} rows — skipping alumni seed.`);
  } else {
    await db.insert(alumniProfilesTable).values(alumni);
    console.log(`Seeded ${alumni.length} alumni profiles.`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
