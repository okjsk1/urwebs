// src/pages/CategoryStartPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StartPage } from '../components/StartPage';

import {
  websites as websitesArchitecture,
  categoryOrder as orderArchitecture,
  categoryConfig as configArchitecture,
} from '../data/websites';
import {
  websites as websitesRealEstate,
  categoryOrder as orderRealEstate,
  categoryConfig as configRealEstate,
} from '../data/websites.realestate';
import {
  websites as websitesStocks,
  categoryOrder as orderStocks,
  categoryConfig as configStocks,
} from '../data/websites.stocks';

import type { FavoritesData, Website } from '../types';
import {
  loadFavoritesData,
  saveFavoritesData,
  applyStarter,
  resetFavorites,
} from '../utils/startPageStorage';
import categories from '../data/categories';

type Props = {
  categorySlug: string;
  title?: string;
  jsonFile?: string;
  storageNamespace?: string;
};

export default function CategoryStartPage({
  categorySlug,
  title = '나의 시작페이지',
  jsonFile = 'websites.json',
  storageNamespace = `favorites:${categorySlug}`,
}: Props) {
  const navigate = useNavigate();

  // 카테고리별 로컬 폴백 데이터 맵
  const dataMap = {
    architecture: {
      websites: websitesArchitecture,
      categoryOrder: orderArchitecture,
      categoryConfig: configArchitecture,
    },
    realestate: {
      websites: websitesRealEstate,
      categoryOrder: orderRealEstate,
      categoryConfig: configRealEstate,
    },
    stocks: {
      websites: websitesStocks,
      categoryOrder: orderStocks,
      categoryConfig: configStocks,
    },
  } as const;

  const fallback =
    dataMap[categorySlug as keyof typeof dataMap] ?? dataMap.architecture;

  const [favoritesData, setFavoritesData] = useState<FavoritesData>(() =>
    loadFavoritesData(storageNamespace),
  );
  const [websites, setWebsites] = useState<Website[]>(fallback.websites);
  const [loading, setLoading] = useState(true);

  const category = categories.find((c) => c.slug === categorySlug);
  const categoryTitle = category?.title || categorySlug;

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
    let cancelled = false;
    (async () => {
      try {
        const base = (import.meta as any).env?.BASE_URL || '/';
        const url = new URL(jsonFile, base).toString();
        const res = await fetch(url, { cache: 'no-store' });
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
