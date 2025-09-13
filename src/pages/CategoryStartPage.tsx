// src/pages/CategoryStartPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StartPage } from '../components/StartPage';

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
  websites as insuranceWebsites,
  categoryOrder as insuranceOrder,
  categoryConfig as insuranceConfig,
} from '../data/websites.insurance';

import type { FavoritesData, Website } from '../types';
import {
  loadFavoritesData,
  saveFavoritesData,
  applyStarter,
  resetFavorites,
} from '../utils/startPageStorage';
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
  const navigate = useNavigate();

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
    webdev: {
      websites: webdevWebsites,
      categoryOrder: webdevOrder,
      categoryConfig: webdevConfig,
    },
    ...roleEntries,
  } as const;

  const fallback =
    dataMap[categorySlug as keyof typeof dataMap] ?? dataMap.architecture;

  const [favoritesData, setFavoritesData] = useState<FavoritesData>(() =>
    loadFavoritesData(storageNamespace),
  );
  const [websites, setWebsites] = useState<Website[]>(fallback.websites);
  const [loading, setLoading] = useState(!!jsonFile);

  const category = categories.find((c) => c.slug === categorySlug);
  const categoryTitle = categoryTitleOverride || category?.title || categorySlug;

  // 페이지 타이틀
  useEffect(() => {
    document.title = `${categoryTitle} | ${title}`;
  }, [categoryTitle, title]);

  // 네임스페이스가 바뀌면 저장된 즐겨찾기 로드
  useEffect(() => {
    setFavoritesData(loadFavoritesData(storageNamespace));
  }, [storageNamespace]);

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

  // 즐겨찾기/위젯 변경 저장
  useEffect(() => {
    saveFavoritesData(favoritesData, storageNamespace);
  }, [favoritesData, storageNamespace]);

  const onApplyStarter = async () => applyStarter(setFavoritesData, storageNamespace);
  const onReset = async () => resetFavorites(setFavoritesData, storageNamespace);

  return (
    <StartPage
      favoritesData={favoritesData}
      onUpdateFavorites={setFavoritesData}
      onClose={() => navigate('/')}
      showDescriptions={true}
      pageTitle={title}
      categoryTitle={categoryTitle}
      websites={websites}
      categoryOrder={fallback.categoryOrder}
      categoryConfig={fallback.categoryConfig}
      loading={loading}
      onApplyStarter={onApplyStarter}
      onReset={onReset}
    />
  );
}
