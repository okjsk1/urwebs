import React from 'react';
import { Eye, Copy, Heart, TrendingUp, Award, Users } from 'lucide-react';

interface CreatorStats {
  views: number;
  clones: number;
  favorites: number;
  templates: number;
  badges: string[];
}

interface CreatorDashboardProps {
  stats: CreatorStats;
  userId: string;
  userName: string;
}

export function CreatorDashboard({ stats, userId, userName }: CreatorDashboardProps) {
  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'Fork 50+':
        return <Copy className="w-4 h-4" />;
      case 'Popular':
        return <TrendingUp className="w-4 h-4" />;
      case 'Creator':
        return <Award className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Fork 50+':
        return 'bg-blue-100 text-blue-800';
      case 'Popular':
        return 'bg-green-100 text-green-800';
      case 'Creator':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{userName}님의 대시보드</h2>
          <p className="text-sm text-gray-600">크리에이터 통계</p>
        </div>
        <div className="flex gap-2">
          {stats.badges.map((badge, index) => (
            <div
              key={index}
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getBadgeColor(badge)}`}
            >
              {getBadgeIcon(badge)}
              {badge}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 조회수 */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-900">
                {stats.views.toLocaleString()}
              </div>
              <div className="text-sm text-blue-600">조회수</div>
            </div>
          </div>
        </div>

        {/* 복제수 */}
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Copy className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-900">
                {stats.clones.toLocaleString()}
              </div>
              <div className="text-sm text-green-600">복제수</div>
            </div>
          </div>
        </div>

        {/* 즐겨찾기 */}
        <div className="bg-red-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-900">
                {stats.favorites.toLocaleString()}
              </div>
              <div className="text-sm text-red-600">즐겨찾기</div>
            </div>
          </div>
        </div>

        {/* 템플릿 수 */}
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-900">
                {stats.templates.toLocaleString()}
              </div>
              <div className="text-sm text-purple-600">템플릿</div>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">최근 활동</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">개발자 대시보드 템플릿</p>
              <p className="text-xs text-gray-600">15명이 조회했습니다</p>
            </div>
            <span className="text-xs text-gray-500">2시간 전</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Copy className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">학생 학습 관리 템플릿</p>
              <p className="text-xs text-gray-600">3명이 복제했습니다</p>
            </div>
            <span className="text-xs text-gray-500">5시간 전</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">마케터 인사이트 템플릿</p>
              <p className="text-xs text-gray-600">새로운 즐겨찾기</p>
            </div>
            <span className="text-xs text-gray-500">1일 전</span>
          </div>
        </div>
      </div>
    </div>
  );
}
