import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Star, Users, ArrowRight } from 'lucide-react';
import { trackEvent, ANALYTICS_EVENTS } from '../../utils/analytics';

export function SocialProof() {
  const navigate = useNavigate();

  const stats = [
    {
      icon: TrendingUp,
      value: '1,347+',
      label: '최근 30일 생성 위젯',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Star,
      value: '4.9/5',
      label: '사용자 만족도',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: Users,
      value: '인기 페이지 구경',
      label: '커뮤니티 참여',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  // 더미 아바타 데이터
  const avatars = [
    { name: '김개발', color: 'bg-blue-500' },
    { name: '이디자인', color: 'bg-green-500' },
    { name: '박마케팅', color: 'bg-purple-500' },
    { name: '최학생', color: 'bg-orange-500' },
    { name: '정자영업', color: 'bg-pink-500' },
    { name: '한투자', color: 'bg-indigo-500' },
    { name: '강캠핑', color: 'bg-teal-500' },
    { name: '윤부동산', color: 'bg-red-500' }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`${stat.bgColor} rounded-xl p-6 text-center`}
          >
            <div className="flex justify-center mb-3">
              <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 mb-3">
              {stat.label}
            </div>
            
            {/* 커뮤니티 카드에만 아바타 표시 */}
            {index === 2 && (
              <div className="space-y-3">
                <div className="flex justify-center -space-x-2">
                  {avatars.slice(0, 6).map((avatar, avatarIndex) => (
                    <div
                      key={avatarIndex}
                      className={`w-8 h-8 rounded-full ${avatar.color} flex items-center justify-center text-white text-xs font-medium border-2 border-white`}
                      title={avatar.name}
                    >
                      {avatar.name.charAt(0)}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    trackEvent(ANALYTICS_EVENTS.SOCIAL_PROOF_CLICK, { action: 'view_popular_pages' });
                    navigate('/pages');
                  }}
                  className="text-xs text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1 mx-auto"
                >
                  인기 페이지 구경하기
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
