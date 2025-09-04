// components/AddWebsiteModal.tsx

import React, { useState, useEffect } from 'react';
import { CustomSite } from '../types';
import { useRecommendedSites } from '../hooks/useRecommendedSites';

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSite: (site: CustomSite, folderId: string) => void;
  favoritesData: any;
  recommendedSites?: { title: string; url: string }[];
}

export function AddWebsiteModal({
  isOpen,
  onClose,
  onAddSite,
  favoritesData,
  recommendedSites,
}: AddWebsiteModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const defaultSuggestions = useRecommendedSites();
  const suggestions = recommendedSites || defaultSuggestions;

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setUrl('');
      setSelectedFolder('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!url.startsWith('http')) {
      setTitle('');
      return;
    }
    
    // 디바운스 시간을 300ms로 단축하여 반응성 개선
    const handler = setTimeout(async () => {
      setIsLoading(true);
      setError('');
      try {
        // 타임아웃을 5초로 설정하여 빠른 응답 보장
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        const data = await response.json();
        const html = data.contents;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const pageTitle = doc.querySelector('title')?.innerText || '';
        if (pageTitle) {
          setTitle(pageTitle.trim());
        } else {
          // URL에서 도메인명을 추출하여 기본 제목으로 사용
          const domain = new URL(url).hostname.replace('www.', '');
          setTitle(domain);
        }
      } catch (err) {
        console.error('Failed to fetch page title:', err);
        // 오류 시 도메인명을 기본 제목으로 사용
        try {
          const domain = new URL(url).hostname.replace('www.', '');
          setTitle(domain);
        } catch {
          setTitle(url);
        }
        setError('제목을 자동으로 가져올 수 없습니다. 직접 입력해주세요.');
      } finally {
        setIsLoading(false);
      }
    }, 300); // 디바운스 시간 단축

    return () => {
      clearTimeout(handler);
    };
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) {
      setError('사이트 제목과 URL을 입력해주세요.');
      return;
    }

    const newSite: CustomSite = {
      id: `custom-${Date.now()}`,
      title,
      url,
      description: '',
      category: 'custom',
      isCustom: true,
    };
    
    // onAddSite 함수에 newSite와 selectedFolder를 함께 전달
    onAddSite(newSite, selectedFolder);
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 overflow-y-auto h-full w-full flex justify-center items-center z-50"
      style={{
        backdropFilter: 'blur(4px)',
        background: 'rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96 max-w-full">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">새 사이트 추가</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">사이트 제목</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isLoading ? '제목을 가져오는 중...' : '제목을 직접 입력하세요'}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="folder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">폴더</label>
            <select
              id="folder"
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="">즐겨찾기 (폴더 없음)</option>
              {favoritesData?.folders?.map((folder: any) => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? '추가 중...' : '사이트 추가'}
            </button>
          </div>
        </form>
        {suggestions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              추천 사이트
            </h4>
            <ul className="space-y-2">
              {suggestions.map((site) => (
                <li
                  key={site.url}
                  className="flex justify-between items-center text-sm"
                >
                  <div className="mr-2 overflow-hidden">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {site.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {site.url}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTitle(site.title);
                      setUrl(site.url);
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    추가
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}