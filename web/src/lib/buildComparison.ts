import type { ProductPassport } from "./productModel";

function labelForIndex(i: number): string {
  return ["First", "Second", "Third"][i] ?? `Product ${i + 1}`;
}

function shortName(p: ProductPassport): string {
  return p.brand ? `${p.brand} ${p.name}` : p.name;
}

export function buildComparisonNarrative(passports: ProductPassport[]): string {
  if (passports.length === 0) return "";
  if (passports.length === 1) {
    const p = passports[0];
    return `${shortName(p)}. ${p.priceText ?? ""} ${p.fitSummary ? `Fit: ${p.fitSummary.verdict}.` : ""} Return risk: ${p.returnRisk.label}. ${p.sustainability ? `Sustainability: ${p.sustainability.rating}, ${p.sustainability.overallScore} out of 100.` : ""}`.trim();
  }

  const parts: string[] = [];
  passports.forEach((p, i) => {
    const label = labelForIndex(i);
    const name = shortName(p);
    const fit = p.fitSummary ? `${p.fitSummary.verdict}` : "no fit data";
    const risk = p.returnRisk.label;
    const sust = p.sustainability
      ? `${p.sustainability.rating}, ${p.sustainability.overallScore} out of 100`
      : "no sustainability data";
    parts.push(
      `${label} product, ${name}: ${p.priceText ?? ""} Fit: ${fit}. Return risk: ${risk}. Sustainability: ${sust}.`
    );
  });

  const diffParts: string[] = [];
  const fits = passports.map((p) => p.fitSummary?.verdict);
  if (new Set(fits).size > 1) {
    const fitStr = passports
      .map((p, i) => `${labelForIndex(i)} ${p.fitSummary?.verdict ?? "no data"}`)
      .join("; ");
    diffParts.push(`Fit differs: ${fitStr}.`);
  }
  const risks = passports.map((p) => p.returnRisk.label);
  if (new Set(risks).size > 1) {
    const riskStr = passports
      .map((p, i) => `${labelForIndex(i)} has ${p.returnRisk.label} return risk`)
      .join("; ");
    diffParts.push(riskStr);
  }
  const sustScores = passports
    .filter((p) => p.sustainability)
    .map((p) => p.sustainability!.overallScore);
  if (sustScores.length >= 2 && new Set(sustScores).size > 1) {
    const best = passports.reduce((best, p) => {
      const s = p.sustainability?.overallScore ?? 0;
      return s > (best?.sustainability?.overallScore ?? 0) ? p : best;
    });
    diffParts.push(`${shortName(best)} has the best sustainability score.`);
  }

  return [...parts, ...diffParts].join(" ");
}

export interface AttributeSection {
  title: string;
  readText: string;
  items: { label: string; value: string }[];
}

export function buildAttributeSections(passports: ProductPassport[]): AttributeSection[] {
  const sections: AttributeSection[] = [];

  if (passports.length === 0) return sections;

  const priceItems = passports.map((p) => ({
    label: shortName(p),
    value: p.priceText ?? "—",
  }));
  sections.push({
    title: "Price",
    readText: priceItems.map((x) => `${x.label}: ${x.value}`).join(". "),
    items: priceItems,
  });

  const fitItems = passports.map((p) => ({
    label: shortName(p),
    value: p.fitSummary ? `${p.fitSummary.verdict} (${Math.round(p.fitSummary.confidence * 100)}% confidence)` : "No data",
  }));
  sections.push({
    title: "Fit",
    readText: fitItems.map((x) => `${x.label}: ${x.value}`).join(". "),
    items: fitItems,
  });

  const riskItems = passports.map((p) => ({
    label: shortName(p),
    value: p.returnRisk.label,
  }));
  sections.push({
    title: "Return risk",
    readText: riskItems.map((x) => `${x.label}: ${x.value}`).join(". "),
    items: riskItems,
  });

  const sustItems = passports.map((p) => ({
    label: shortName(p),
    value: p.sustainability
      ? `${p.sustainability.rating} (${p.sustainability.overallScore}/100)`
      : "No data",
  }));
  sections.push({
    title: "Sustainability",
    readText: sustItems.map((x) => `${x.label}: ${x.value}`).join(". "),
    items: sustItems,
  });

  return sections;
}
