import type { RegistrySite } from "./registry";

const order = {
  public: 1,
  association: 2,
  insurer: 3,
  compare: 4,
  edu: 5,
  stats: 6,
  tool: 7,
  community: 8,
} as const;

export const sortSites = (a: RegistrySite, b: RegistrySite) =>
  (order[a.sourceType] ?? 99) - (order[b.sourceType] ?? 99);
