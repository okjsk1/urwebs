import React, { useState, useEffect } from 'react';

interface NewsWidgetProps {
  id: string;
  onRemove: (id: string) => void;
}

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  time: string;
}

export function NewsWidget({ id, onRemove }: NewsWidgetProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('general');

  // 가짜 뉴스 데이터 (실제 환경에서는 뉴스 API를 사용)
  const mockNews: Record<string, NewsItem[]> = {
    general: [
      {
        id: '1',
        title: '건축업계 새로운 트렌드 등장',
        url: '#',
        source: '건축신문',
        time: '2시간 전'
      },
      {
        id: '2',
        title: '친환경 건축 소재 개발 완료',
        url: '#',
        source: '디자인뉴스',
        time: '4시간 전'
      },
      {
        id: '3',
        title: '스마트홈 기술 발전 현황',
        url: '#',
        source: '테크뉴스',
        time: '6시간 전'
      }
    ],
    tech: [
      {
        id: '4',
        title: 'AI 건축 설계 도구 출시',
        url: '#',
        source: 'IT뉴스',
        time: '1시간 전'
      },
      {
        id: '5',
        title: '3D 프린팅 건축 기술 혁신',
        url: '#',
        source: '테크리뷰',
        time: '3시간 전'
      },
      {
        id: '6',
        title: 'VR 설계 프로그램 업데이트',
        url: '#',
        source: '디지털뉴스',
        time: '5시간 전'
      }
    ],
    design: [
      {
        id: '7',
        title: '2024 인테리어 트렌드 발표',
        url: '#',
        source: '디자인매거진',
        time: '30분 전'
      },
      {
        id: '8',
        title: '모던 건축의 새로운 방향성',
        url: '#',
        source: '건축리뷰',
        time: '2시간 전'
      },
      {
        id: '9',
        title: '지속가능한 디자인 사례',
        url: '#',
        source: '그린디자인',
        time: '4시간 전'
      }
    ]
  };

  useEffect(() => {
    setLoading(true);
    // 실제 API 호출 시뮬레이션
    setTimeout(() => {
      setNews(mockNews[category] || []);
      setLoading(false);
    }, 500);
  }, [category]);

  const categories = [
    { value: 'general', label: '일반' },
    { value: 'tech', label: '기술' },
    { value: 'design', label: '디자인' }
  ];

  const refreshNews = () => {
    setLoading(true);
    setTimeout(() => {
      // 가짜 새로고침 - 시간 업데이트
      const updatedNews = news.map(item => ({
        ...item,
        time: `${Math.floor(Math.random() * 5) + 1}분 전`
      }));
      setNews(updatedNews);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border h-full relative">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-800">📰 뉴스</h3>
        <div className="flex gap-1">
          <button
            onClick={refreshNews}
            className="text-blue-500 hover:text-blue-700 text-xs"
            disabled={loading}
          >
            {loading ? '⟳' : '↻'}
          </button>
          <button
            onClick={() => onRemove(id)}
            className="text-red-500 hover:text-red-700 text-xs"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="mb-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-2 py-1 border rounded text-xs"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {loading ? (
          <div className="text-center py-4">
            <div className="text-xs text-gray-500">뉴스 로딩 중...</div>
          </div>
        ) : (
          news.map((item) => (
            <div key={item.id} className="p-2 bg-gray-50 rounded hover:bg-gray-100">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <h4 className="text-xs font-medium text-gray-800 line-clamp-2 hover:text-blue-600">
                  {item.title}
                </h4>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">{item.source}</span>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </div>
              </a>
            </div>
          ))
        )}

        {!loading && news.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-4">
            뉴스를 불러올 수 없습니다
          </p>
        )}
      </div>
    </div>
  );
}