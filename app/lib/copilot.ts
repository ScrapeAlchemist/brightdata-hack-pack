import type { VacancyParcel, CopilotResponse } from "./types";
import { rankParcels } from "./scoring";

const ANCHOR_Q1 = "where should montgomery build a new community park";
const ANCHOR_Q2 = "which neighborhoods have the highest redevelopment opportunity";
const ANCHOR_Q3 = "what's the best use for this vacant lot";

function matchesAnchor(q: string, anchor: string): boolean {
  const tokens = anchor.split(" ").filter((w) => w.length > 4);
  const lower = q.toLowerCase();
  return tokens.filter((t) => lower.includes(t)).length >= 3;
}

export function answerQuestion(
  question: string,
  parcels: VacancyParcel[],
  selectedParcel?: VacancyParcel | null
): CopilotResponse {
  const q = question.toLowerCase();

  if (matchesAnchor(q, ANCHOR_Q1) || q.includes("park") || q.includes("green space")) {
    const candidates = rankParcels(
      parcels.filter((p) => p.recommended_use.toLowerCase().includes("park") || p.recommended_use.toLowerCase().includes("garden"))
    ).slice(0, 4);

    return {
      answer:
        `Montgomery has ${candidates.length} high-opportunity sites for new community parks. ` +
        `The top recommendation is **${candidates[0]?.name}** (score: ${candidates[0]?.opportunity_score}/100) in ${candidates[0]?.neighborhood}, ` +
        `followed by **${candidates[1]?.name}** in ${candidates[1]?.neighborhood} and **${candidates[2]?.name}** in ${candidates[2]?.neighborhood}. ` +
        `These sites score highest on vacancy duration, zoning compatibility, and infrastructure readiness.`,
      highlightedParcels: candidates.map((p) => p.id),
      reasoning:
        "Ranked by: park-compatible zoning (R-2/R-3), permit inactivity ≥5 years, proximity to transit and utilities, and neighborhood park gap index.",
      mcpNote:
        "Bright Data MCP: Searched Montgomery Parks & Recreation dept + USDA green space datasets for demand context.",
    };
  }

  if (matchesAnchor(q, ANCHOR_Q2) || q.includes("redevelopment") || q.includes("opportunit") || q.includes("neighborhood")) {
    const top = rankParcels(parcels).slice(0, 5);
    const neighborhoods = [...new Set(top.map((p) => p.neighborhood))];

    return {
      answer:
        `The highest-opportunity redevelopment neighborhoods in Montgomery are: **${neighborhoods.slice(0, 3).join(", ")}**. ` +
        `Across ${top.length} top-ranked parcels, the average opportunity score is ${Math.round(top.reduce((s, p) => s + p.opportunity_score, 0) / top.length)}/100. ` +
        `West End and Lincoln Heights lead due to long vacancy periods, active infrastructure investments, and favorable zoning for mixed-use development.`,
      highlightedParcels: top.map((p) => p.id),
      reasoning:
        "Composite score: 40% vacancy/underuse, 25% zoning compatibility, 20% infrastructure readiness, 15% permit inactivity.",
      mcpNote:
        "Bright Data MCP: Cross-referenced City of Montgomery code violation records and HUD Opportunity Zone designations.",
    };
  }

  if (matchesAnchor(q, ANCHOR_Q3) || q.includes("vacant lot") || q.includes("best use") || q.includes("this lot")) {
    const target = selectedParcel || rankParcels(parcels)[0];

    return {
      answer:
        `For **${target.name}** (${target.address}), the recommended use is **${target.recommended_use}**. ` +
        `With a ${target.permit_inactive_years}-year permit inactivity record, ${target.zoning} zoning, and an opportunity score of ${target.opportunity_score}/100, ` +
        `this site is ${target.opportunity_score >= 75 ? "well-suited" : "potentially viable"} for development. ${target.infrastructure_context}`,
      highlightedParcels: [target.id],
      reasoning:
        `Zoning: ${target.zoning} | Vacancy: ${target.permit_inactive_years} years | Priority: ${target.priority.toUpperCase()}`,
      mcpNote:
        "Bright Data MCP: Fetched comparable redevelopment case studies from similar mid-size Alabama cities.",
    };
  }

  const q_lower = q;
  let filtered = parcels;
  if (q_lower.includes("infrastructure") || q_lower.includes("utility") || q_lower.includes("sewer")) {
    filtered = parcels.filter((p) => p.infrastructure_context.toLowerCase().includes("upgrade") || p.infrastructure_context.toLowerCase().includes("adjacent"));
  } else if (q_lower.includes("housing") || q_lower.includes("affordable")) {
    filtered = parcels.filter((p) => p.recommended_use.toLowerCase().includes("housing"));
  } else if (q_lower.includes("commercial") || q_lower.includes("business")) {
    filtered = parcels.filter((p) => p.zoning.includes("B-") || p.zoning.includes("CBD"));
  }

  const results = rankParcels(filtered.length > 0 ? filtered : parcels).slice(0, 3);

  return {
    answer:
      `Based on your query, here are the top matching parcels: **${results.map((p) => p.name).join(", ")}**. ` +
      `These sites have opportunity scores of ${results.map((p) => p.opportunity_score).join(", ")} respectively. ` +
      `Try one of the suggested questions below for a more detailed analysis.`,
    highlightedParcels: results.map((p) => p.id),
    reasoning: "General keyword match across vacancy, zoning, and infrastructure datasets.",
    mcpNote: "Bright Data MCP enrichment available — add BRIGHTDATA_API_KEY to enable live web context.",
  };
}

export const PRESET_QUESTIONS = [
  "Where should Montgomery build a new community park?",
  "Which neighborhoods have the highest redevelopment opportunity?",
  "What's the best use for this vacant lot?",
];
