// 간단한 i18n 훅 (react-i18next 대신)
import { useState, useEffect } from 'react';

export type Locale = 'ko' | 'en';

interface Translations {
  [key: string]: string;
}

const translations: Record<Locale, Translations> = {
  ko: {
    // Header
    'header.notice': '공지사항',
    'header.community': '자유게시판',
    'header.contact': '문의하기',
    'header.mypage': '나의 페이지',
    'header.admin': '관리페이지',
    'header.theme.light': '라이트 모드로 전환',
    'header.theme.dark': '다크 모드로 전환',
    'header.theme.light.title': '라이트 모드',
    'header.theme.dark.title': '다크 모드',
    'header.nav.notice': '공지사항으로 이동',
    'header.nav.community': '자유게시판으로 이동',
    'header.nav.contact': '문의하기로 이동',
    'header.nav.mypage': '나의 페이지로 이동',
    'header.nav.admin': '관리페이지로 이동',
    'header.brand.subtitle': '편하고로 빠르게 시작하세요',
    'header.loading': '로딩 중...',
  },
  en: {
    // Header
    'header.notice': 'Notice',
    'header.community': 'Community',
    'header.contact': 'Contact',
    'header.mypage': 'My Page',
    'header.admin': 'Admin',
    'header.theme.light': 'Switch to light mode',
    'header.theme.dark': 'Switch to dark mode',
    'header.theme.light.title': 'Light mode',
    'header.theme.dark.title': 'Dark mode',
    'header.nav.notice': 'Go to notice',
    'header.nav.community': 'Go to community',
    'header.nav.contact': 'Go to contact',
    'header.nav.mypage': 'Go to my page',
    'header.nav.admin': 'Go to admin',
    'header.brand.subtitle': 'Start quickly and easily',
    'header.loading': 'Loading...',
  }
};

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('locale') as Locale;
    return saved || 'ko';
  });

  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return {
    t,
    locale,
    changeLocale
  };
}
