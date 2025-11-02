/**
 * 내 관심 페이지 (좋아요한 페이지 목록)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { Heart, ExternalLink, User } from 'lucide-react';
import { Button } from '../components/ui/button';

interface PageCardProps {
  favorite: {
    pageId: string;
    pageOwnerId: string;
    pageTitle: string;
    pageThumbnail?: string;
    pageUrl: string;
    authorName?: string;
  };
  onRemove: (pageId: string) => void;
}

function PageCard({ favorite, onRemove }: PageCardProps) {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(favorite.pageUrl);
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
      style={{
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={(e) => {
        if (!e.currentTarget) return;
        e.currentTarget.style.backgroundColor = 'var(--stealth-surface-muted, #f1f3f5)';
      }}
      onMouseLeave={(e) => {
        if (!e.currentTarget) return;
        e.currentTarget.style.backgroundColor = 'var(--stealth-surface, #f9fafb)';
      }}
    >
      {/* 썸네일 영역 */}
      <div 
        className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundColor: 'var(--stealth-surface-muted, #f1f3f5)',
        }}
      >
        {favorite.pageThumbnail ? (
          <img 
            src={favorite.pageThumbnail} 
            alt={favorite.pageTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 dark:text-gray-500 text-4xl">📄</div>
        )}
        
        {/* 좋아요 취소 버튼 (hover 시 표시) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('관심 페이지에서 제거하시겠습니까?')) {
              onRemove(favorite.pageId);
            }
          }}
          className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/20"
          aria-label="관심 취소"
        >
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
        </button>
      </div>

      {/* 카드 내용 */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2" style={{
          fontSize: '14px',
          lineHeight: '1.55',
        }}>
          {favorite.pageTitle}
        </h3>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <User className="w-3 h-3" />
          <span>작성자: {favorite.authorName || favorite.pageOwnerId}</span>
        </div>

        <Button
          onClick={handleOpen}
          variant="outline"
          size="sm"
          className="w-full"
          style={{
            borderColor: 'var(--stealth-button-border, #d3d6db)',
            fontSize: '13px',
          }}
        >
          <ExternalLink className="w-3 h-3 mr-2" />
          열기
        </Button>
      </div>
    </div>
  );
}

export function FavoritesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { favorites, loading, removeFavorite } = useFavorites(user?.uid || null);

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            로그인이 필요합니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            관심 페이지를 보려면 로그인해주세요.
          </p>
          <Button
            onClick={() => navigate('/mypage')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            로그인하고 시작하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      backgroundColor: 'var(--stealth-bg, #f5f6f7)',
    }}>
      {/* 헤더 */}
      <header className="sticky top-0 z-50 border-b" style={{
        backgroundColor: 'var(--stealth-surface, #f9fafb)',
        borderColor: 'var(--stealth-border, rgba(0,0,0,0.05))',
        boxShadow: 'var(--stealth-shadow, 0 1px 2px rgba(0,0,0,0.04))',
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100" style={{
                fontSize: '18px',
                fontWeight: 'var(--stealth-font-weight-header, 500)',
              }}>
                내 관심 페이지
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1" style={{
                fontSize: '13px',
              }}>
                자주 방문하는 사람들의 페이지를 모았습니다.
              </p>
            </div>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              style={{
                borderColor: 'var(--stealth-button-border, #d3d6db)',
              }}
            >
              메인으로
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
              아직 관심 페이지가 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              다른 사람의 공개 페이지를 탐색하고 관심을 표시해보세요.
            </p>
            <Button
              onClick={() => navigate('/pages')}
              variant="outline"
              style={{
                borderColor: 'var(--stealth-button-border, #d3d6db)',
              }}
            >
              페이지 탐색하기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favorites.map((favorite) => (
              <PageCard
                key={favorite.pageId}
                favorite={favorite}
                onRemove={removeFavorite}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
