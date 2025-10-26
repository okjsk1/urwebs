import React, { useEffect, useRef, useState } from 'react';
import { Search, Cloud, CheckSquare, Calendar, DollarSign, Bookmark, BookOpen, Globe } from 'lucide-react';

interface RailItem {
  id: string;
  title: string;
  tag: string;
  icon: React.ComponentType<any>;
  color: string;
}

export function AutoRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const railItems: RailItem[] = [
    { id: '1', title: '검색 위젯', tag: '검색', icon: Search, color: 'bg-blue-100 text-blue-600' },
    { id: '2', title: '날씨 위젯', tag: '날씨', icon: Cloud, color: 'bg-sky-100 text-sky-600' },
    { id: '3', title: '할 일 위젯', tag: '할일', icon: CheckSquare, color: 'bg-green-100 text-green-600' },
    { id: '4', title: '캘린더 위젯', tag: '캘린더', icon: Calendar, color: 'bg-purple-100 text-purple-600' },
    { id: '5', title: '환율 위젯', tag: '환율', icon: DollarSign, color: 'bg-yellow-100 text-yellow-600' },
    { id: '6', title: '북마크 위젯', tag: '북마크', icon: Bookmark, color: 'bg-red-100 text-red-600' },
    { id: '7', title: '영어학습 위젯', tag: '학습', icon: BookOpen, color: 'bg-indigo-100 text-indigo-600' },
    { id: '8', title: '뉴스 위젯', tag: '뉴스', icon: Globe, color: 'bg-orange-100 text-orange-600' }
  ];

  // IntersectionObserver로 화면 진입 시 애니메이션 시작
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (railRef.current) {
      observer.observe(railRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 아이템을 두 번 복제하여 무한 스크롤 효과
  const duplicatedItems = [...railItems, ...railItems];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur border shadow-sm">
      <div
        ref={railRef}
        className={`flex gap-4 py-6 ${isVisible ? 'rail-animation' : ''}`}
        style={{ width: '200%' }}
      >
        {duplicatedItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={`${item.id}-${index}`}
              className="min-w-[220px] rounded-xl border bg-white p-4 shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                  <span className="text-xs text-gray-500">#{item.tag}</span>
                </div>
              </div>
              <div className="text-xs text-gray-600">
                {item.title}로 나만의 대시보드를 완성하세요
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
