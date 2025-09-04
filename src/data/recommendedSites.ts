export interface RecommendedSite {
  title: string;
  url: string;
}

export const defaultRecommendedSites: RecommendedSite[] = [
  {
    title: 'Google',
    url: 'https://www.google.com',
  },
  {
    title: 'Wikipedia',
    url: 'https://www.wikipedia.org',
  },
  {
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com',
  },
];
