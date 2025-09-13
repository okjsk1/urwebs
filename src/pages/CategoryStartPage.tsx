// src/pages/CategoryStartPage.tsx
import React, { useEffect, useState } from 'react';
import { CategoryPageLayout } from '../components/CategoryPageLayout';

import {
  websites as defaultWebsites,
  categoryOrder as defaultOrder,
  categoryConfig as defaultConfig,
} from '../data/websites';
import {
  websites as realestateWebsites,
  categoryOrder as realestateOrder,
  categoryConfig as realestateConfig,
} from '../data/websites.realestate';
import { roleData as realestateRoleData } from '../data/websites.realestate.roles';
import {
  websites as stocksWebsites,
  categoryOrder as stocksOrder,
  categoryConfig as stocksConfig,
} from '../data/websites.stocks';
import {
  websites as webdevWebsites,
  categoryOrder as webdevOrder,
  categoryConfig as webdevConfig,
} from '../data/websites.webdev';
import {
  websites as dataAiWebsites,
  categoryOrder as dataAiOrder,
  categoryConfig as dataAiConfig,
} from '../data/websites.data-ai';
import {
  websites as insuranceWebsites,
  categoryOrder as insuranceOrder,
  categoryConfig as insuranceConfig,
} from '../data/websites.insurance';
import {
  websites as videoWebsites,
  categoryOrder as videoOrder,
  categoryConfig as videoConfig,
} from '../data/websites.video';
import {
  websites as embeddedWebsites,
  categoryOrder as embeddedOrder,
  categoryConfig as embeddedConfig,
} from '../data/websites.embedded';
import {

  websites as marketingWebsites,
  categoryOrder as marketingOrder,
  categoryConfig as marketingConfig,
} from '../data/websites.marketing';
import {
  websites as designWebsites,
  categoryOrder as designOrder,
  categoryConfig as designConfig,
} from '../data/websites.design';
import {
  websites as cloudWebsites,
  categoryOrder as cloudOrder,
  categoryConfig as cloudConfig,
} from '../data/websites.cloud';

import type { Website } from '../types';
import categories from '../data/categories';
import { buildAssetUrl } from '../utils/asset';

type Props = {
  categorySlug: string;
  title?: string;
  jsonFile?: string;
  storageNamespace?: string;
  /** 부동산 역할별 페이지 등에서 카테고리 제목 커스터마이즈 */
  categoryTitleOverride?: string;
};

export default function CategoryStartPage({
  categorySlug,
  title = '나의 시작페이지',
  jsonFile,
  storageNamespace = `favorites:${categorySlug}`,
  categoryTitleOverride,
}: Props) {

  // 카테고리별 로컬 폴백 데이터 맵
  const roleEntries = Object.entries(realestateRoleData).reduce(
    (acc, [role, data]) => {
      acc[`realestate-${role}`] = data;
      return acc;
    },
    {} as Record<string, { websites: Website[]; categoryOrder: string[]; categoryConfig: typeof defaultConfig }>,
  );

  const dataMap = {
    architecture: {
      websites: defaultWebsites,
      categoryOrder: defaultOrder,
      categoryConfig: defaultConfig,
    },
    embedded: {
      websites: embeddedWebsites,
      categoryOrder: embeddedOrder,
      categoryConfig: embeddedConfig,
    },
    realestate: {
      websites: realestateWebsites,
      categoryOrder: realestateOrder,
      categoryConfig: realestateConfig,
    },
    stocks: {
      websites: stocksWebsites,
      categoryOrder: stocksOrder,
      categoryConfig: stocksConfig,
    },
    insurance: {
      websites: insuranceWebsites,
      categoryOrder: insuranceOrder,
      categoryConfig: insuranceConfig,
    },

    embedded: {
      websites: embeddedWebsites,
      categoryOrder: embeddedOrder,
      categoryConfig: embeddedConfig,
    },
    wedding: {
      websites: weddingWebsites,
      categoryOrder: weddingOrder,
      categoryConfig: weddingConfig,
    },
    'data-ai': {
      websites: dataAiWebsites,
      categoryOrder: dataAiOrder,
      categoryConfig: dataAiConfig,
    },
    webdev: {
      websites: webdevWebsites,
      categoryOrder: webdevOrder,
      categoryConfig: webdevConfig,
    },
    marketing: {
      websites: marketingWebsites,
      categoryOrder: marketingOrder,
      categoryConfig: marketingConfig,
    },
    design: {
      websites: designWebsites,
      categoryOrder: designOrder,
      categoryConfig: designConfig,
    },
    cloud: {
      websites: cloudWebsites,
      categoryOrder: cloudOrder,
      categoryConfig: cloudConfig,
    },
    ...roleEntries,
  } as const;

  const fallback =
    dataMap[categorySlug as keyof typeof dataMap] ?? dataMap.architecture;

  const [websites, setWebsites] = useState<Website[]>(fallback.websites);
  const [loading, setLoading] = useState(!!jsonFile);

  const category = categories.find((c) => c.slug === categorySlug);
  const categoryTitle = categoryTitleOverride || category?.title || categorySlug;

  // 슬러그가 바뀌면 우선 폴백으로 채움(즉시 화면 표시)
  useEffect(() => {
    setWebsites(fallback.websites);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug]);

  // jsonFile이 있으면 성공 시 폴백을 덮어씀
  useEffect(() => {
    if (!jsonFile) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(buildAssetUrl(jsonFile), { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) throw new Error(`Invalid content-type: ${ct}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Invalid websites.json shape');
        if (!cancelled) setWebsites(data);
      } catch (e) {
        console.warn('websites.json 불러오기 실패:', e);
        // 실패 시 폴백 유지
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [jsonFile]);

  return (
    <CategoryPageLayout
      websites={websites}
      categoryOrder={fallback.categoryOrder}
      categoryConfig={fallback.categoryConfig}
      storageNamespace={storageNamespace}
      pageTitle={title}
      categoryTitle={categoryTitle}
      loading={loading}
      showDescriptions={true}
    />
  );
}
