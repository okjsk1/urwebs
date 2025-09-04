import { useEffect, useState } from 'react';
import { RecommendedSite, defaultRecommendedSites } from '../data/recommendedSites';

/**
 * Hook to retrieve recommended sites.
 * If a userId is provided, attempts to fetch personalized
 * recommendations from a future AI service endpoint.
 * Falls back to a static list of suggestions.
 */
export function useRecommendedSites(userId?: string) {
  const [sites, setSites] = useState<RecommendedSite[]>(defaultRecommendedSites);

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();

    async function fetchRecommendations() {
      try {
        const res = await fetch(`/api/recommendations?user=${userId}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setSites(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch AI recommendations', err);
        // retain current suggestions
      }
    }

    fetchRecommendations();

    return () => controller.abort();
  }, [userId]);

  return sites;
}
