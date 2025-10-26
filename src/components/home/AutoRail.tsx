import React, { useEffect, useRef, useState } from 'react';
import { 
  Search, Cloud, CheckSquare, Calendar, DollarSign, Bookmark, BookOpen, Globe,
  Timer, Quote, FileText, TrendingUp, BarChart3, Mic, Camera, Zap,
  Heart, Star, Target, Clock, Bell, Mail, QrCode, Link, Palette
} from 'lucide-react';

interface RailItem {
  id: string;
  title: string;
  tag: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

export function AutoRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const railItems: RailItem[] = [
    { id: '1', title: '구글 검색', tag: '검색', icon: Search, color: 'bg-blue-100 text-blue-600', description: 'Google 검색 바로가기' },
    { id: '2', title: '날씨 정보', tag: '날씨', icon: Cloud, color: 'bg-sky-100 text-sky-600', description: '실시간 날씨 정보' },
    { id: '3', title: '할 일 목록', tag: '할일', icon: CheckSquare, color: 'bg-green-100 text-green-600', description: '할 일 관리 및 체크' },
    { id: '4', title: '캘린더', tag: '캘린더', icon: Calendar, color: 'bg-purple-100 text-purple-600', description: '일정 관리 및 계획' },
    { id: '5', title: '환율 정보', tag: '환율', icon: DollarSign, color: 'bg-yellow-100 text-yellow-600', description: '실시간 환율 정보' },
    { id: '6', title: '즐겨찾기', tag: '북마크', icon: Bookmark, color: 'bg-red-100 text-red-600', description: '자주 사용하는 링크' },
    { id: '7', title: '영어 단어', tag: '학습', icon: BookOpen, color: 'bg-indigo-100 text-indigo-600', description: '영어 단어 학습 도구' },
    { id: '8', title: '뉴스 피드', tag: '뉴스', icon: Globe, color: 'bg-orange-100 text-orange-600', description: '최신 뉴스 및 관심사' },
    { id: '9', title: '타이머', tag: '생산성', icon: Timer, color: 'bg-emerald-100 text-emerald-600', description: '카운트다운/스톱워치' },
    { id: '10', title: '영감 명언', tag: '영감', icon: Quote, color: 'bg-pink-100 text-pink-600', description: '영감을 주는 명언' },
    { id: '11', title: '빠른 메모', tag: '메모', icon: FileText, color: 'bg-gray-100 text-gray-600', description: '즉석 메모 작성' },
    { id: '12', title: '암호화폐', tag: '투자', icon: TrendingUp, color: 'bg-cyan-100 text-cyan-600', description: '실시간 코인 시세' },
    { id: '13', title: '경제 캘린더', tag: '경제', icon: BarChart3, color: 'bg-teal-100 text-teal-600', description: '경제 지표 일정' },
    { id: '14', title: '네이버 검색', tag: '검색', icon: Search, color: 'bg-green-100 text-green-600', description: '네이버 검색 바로가기' },
    { id: '15', title: '법제처 검색', tag: '법령', icon: Search, color: 'bg-purple-100 text-purple-600', description: '법령 검색 도구' },
    { id: '16', title: 'QR 코드', tag: '도구', icon: QrCode, color: 'bg-slate-100 text-slate-600', description: 'QR 코드 생성' },
    { id: '17', title: 'D-Day', tag: '일정', icon: Target, color: 'bg-rose-100 text-rose-600', description: '기념일/마감일 관리' },
    { id: '18', title: '자주가는 사이트', tag: '추천', icon: Link, color: 'bg-amber-100 text-amber-600', description: '방문 횟수 기반 추천' }
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
                {item.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
