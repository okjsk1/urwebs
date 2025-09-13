import { siteCatalog } from "@/modules/insurance/sites";
import { personaBundles } from "@/modules/insurance/persona-bundles";
import "@/modules/insurance/categoryConfig";

export type SourceType =
  | "public"
  | "association"
  | "insurer"
  | "compare"
  | "edu"
  | "stats"
  | "tool"
  | "community";

export interface RegistrySite {
  id: string;
  category: string;
  title: string;
  url: string;
  description: string;
  sourceType: SourceType;
  tags?: string[];
}

export interface Intent {
  key: string;
  label: string;
  siteIds: string[];
}

export interface Persona {
  key: string;
  label: string;
  emoji?: string;
  defaultIntent?: string;
  intents: Intent[];
}

export interface Domain {
  key: string;
  label: string;
  personas: Persona[];
}

export interface Registry {
  sites: Record<string, RegistrySite>;
  domains: Record<string, Domain>;
}

const sites: Record<string, RegistrySite> = Object.fromEntries(
  siteCatalog.map((s) => [s.id, { ...s, category: "보험" }])
);

const personaMeta: Record<string, { label: string; emoji: string }> = {
  consumer: { label: "개인고객", emoji: "🙋" },
  agent: { label: "설계사", emoji: "💼" },
  expert: { label: "전문가", emoji: "🧠" },
  corporate: { label: "기업·단체", emoji: "🏢" },
  licensePrep: { label: "취업·수험", emoji: "📚" },
  overseas: { label: "해외/유학생", emoji: "🌏" },
};

const insurancePersonas: Persona[] = personaBundles.map((b) => ({
  key: b.persona,
  label: personaMeta[b.persona].label,
  emoji: personaMeta[b.persona].emoji,
  defaultIntent: "main",
  intents: [
    {
      key: "main",
      label: "주요",
      siteIds: b.siteIds,
    },
  ],
}));

const domains: Record<string, Domain> = {
  insurance: {
    key: "insurance",
    label: "보험",
    personas: insurancePersonas,
  },
};

export const registry: Registry = {
  sites,
  domains,
};
