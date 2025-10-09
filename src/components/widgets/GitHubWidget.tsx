// GitHub 저장소 위젯 - 저장소 관리, 실시간 상태, 접근성
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Github, Star, GitFork, Eye, ExternalLink, Plus, Settings } from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';

interface Repository {
  id: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  lastUpdate: string;
  url: string;
  private: boolean;
  issues: number;
  watchers: number;
}

interface GitHubState {
  repositories: Repository[];
  showAddForm: boolean;
  newRepo: Partial<Repository>;
  editingRepo: string | null;
  filterLanguage: string;
  sortBy: 'name' | 'stars' | 'updated' | 'created';
  sortOrder: 'asc' | 'desc';
}

const DEFAULT_REPOS: Repository[] = [
  {
    id: '1',
    name: 'my-project',
    description: '개인 프로젝트 저장소',
    language: 'TypeScript',
    stars: 12,
    forks: 3,
    lastUpdate: '2일 전',
    url: 'https://github.com/username/my-project',
    private: false,
    issues: 2,
    watchers: 8
  },
  {
    id: '2',
    name: 'web-app',
    description: 'React 웹 애플리케이션',
    language: 'React',
    stars: 8,
    forks: 1,
    lastUpdate: '1주 전',
    url: 'https://github.com/username/web-app',
    private: false,
    issues: 0,
    watchers: 5
  },
  {
    id: '3',
    name: 'api-server',
    description: 'Node.js API 서버',
    language: 'Node.js',
    stars: 15,
    forks: 5,
    lastUpdate: '3일 전',
    url: 'https://github.com/username/api-server',
    private: true,
    issues: 1,
    watchers: 12
  }
];

const LANGUAGE_COLORS: { [key: string]: string } = {
  'TypeScript': 'bg-blue-100 text-blue-800',
  'JavaScript': 'bg-yellow-100 text-yellow-800',
  'React': 'bg-cyan-100 text-cyan-800',
  'Node.js': 'bg-green-100 text-green-800',
  'Python': 'bg-purple-100 text-purple-800',
  'Java': 'bg-orange-100 text-orange-800',
  'C++': 'bg-red-100 text-red-800',
  'Go': 'bg-indigo-100 text-indigo-800'
};

export const GitHubWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<GitHubState>(() => {
    const saved = readLocal(widget.id, {
      repositories: DEFAULT_REPOS,
      showAddForm: false,
      newRepo: { language: 'TypeScript', private: false },
      editingRepo: null,
      filterLanguage: 'all',
      sortBy: 'updated',
      sortOrder: 'desc'
    });
    return saved;
  });

  // 상태 저장
  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, updateWidget]);

  const addRepository = useCallback(() => {
    const { name, description, language, url } = state.newRepo;
    
    if (!name?.trim()) {
      showToast('저장소 이름을 입력하세요', 'error');
      return;
    }
    
    if (!url?.trim()) {
      showToast('저장소 URL을 입력하세요', 'error');
      return;
    }

    // URL 유효성 검사
    try {
      new URL(url);
    } catch {
      showToast('올바른 URL을 입력하세요', 'error');
      return;
    }

    const newRepo: Repository = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description?.trim() || '',
      language: language || 'TypeScript',
      stars: 0,
      forks: 0,
      lastUpdate: '방금 전',
      url: url.trim(),
      private: state.newRepo.private || false,
      issues: 0,
      watchers: 0
    };

    setState(prev => ({
      ...prev,
      repositories: [...prev.repositories, newRepo],
      newRepo: { language: 'TypeScript', private: false },
      showAddForm: false
    }));
    showToast('저장소가 추가되었습니다', 'success');
  }, [state.newRepo]);

  const updateRepository = useCallback((id: string, updates: Partial<Repository>) => {
    setState(prev => ({
      ...prev,
      repositories: prev.repositories.map(repo => 
        repo.id === id ? { ...repo, ...updates } : repo
      ),
      editingRepo: null
    }));
    showToast('저장소가 업데이트되었습니다', 'success');
  }, []);

  const deleteRepository = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      repositories: prev.repositories.filter(repo => repo.id !== id)
    }));
    showToast('저장소가 삭제되었습니다', 'success');
  }, []);

  const openRepository = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const copyRepositoryUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    showToast('URL이 복사되었습니다', 'success');
  }, []);

  const filteredAndSortedRepos = useMemo(() => {
    let filtered = state.repositories;
    
    if (state.filterLanguage !== 'all') {
      filtered = filtered.filter(repo => repo.language === state.filterLanguage);
    }
    
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (state.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'stars':
          comparison = a.stars - b.stars;
          break;
        case 'updated':
          // 실제로는 날짜 비교를 해야 하지만, 여기서는 문자열로 처리
          comparison = a.lastUpdate.localeCompare(b.lastUpdate);
          break;
      }
      return state.sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return filtered;
  }, [state.repositories, state.filterLanguage, state.sortBy, state.sortOrder]);

  const uniqueLanguages = useMemo(() => {
    const languages = Array.from(new Set(state.repositories.map(repo => repo.language)));
    return languages.sort();
  }, [state.repositories]);

  return (
    <div className="p-3">
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">🐙</div>
        <h4 className="font-semibold text-sm text-gray-800">GitHub 저장소</h4>
        <p className="text-xs text-gray-500">내 저장소 관리</p>
      </div>

      {/* 필터 및 정렬 */}
      {isEditMode && (
        <div className="mb-3 space-y-2">
          <div className="flex gap-2">
            <select
              value={state.filterLanguage}
              onChange={(e) => setState(prev => ({ ...prev, filterLanguage: e.target.value }))}
              className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded"
              aria-label="언어 필터"
            >
              <option value="all">전체 언어</option>
              {uniqueLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <select
              value={state.sortBy}
              onChange={(e) => setState(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="text-xs px-2 py-1 border border-gray-300 rounded"
              aria-label="정렬 기준"
            >
              <option value="updated">최근 업데이트</option>
              <option value="name">이름순</option>
              <option value="stars">별표순</option>
            </select>
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs"
              onClick={() => setState(prev => ({ 
                ...prev, 
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
              }))}
              aria-label="정렬 순서 변경"
            >
              {state.sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      )}

      {/* 저장소 목록 */}
      <div className="space-y-2">
        {filteredAndSortedRepos.map(repo => (
          <div key={repo.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="text-sm font-medium text-gray-800">{repo.name}</h5>
                  {repo.private && (
                    <span className="text-xs text-gray-500">🔒</span>
                  )}
                </div>
                {repo.description && (
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{repo.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className={`px-2 py-1 rounded-full ${LANGUAGE_COLORS[repo.language] || 'bg-gray-100 text-gray-800'}`}>
                    {repo.language}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {repo.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-3 h-3" />
                    {repo.forks}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {repo.watchers}
                  </span>
                </div>
              </div>
              {isEditMode && (
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => setState(prev => ({ ...prev, editingRepo: repo.id }))}
                    className="text-blue-500 hover:text-blue-700"
                    aria-label="저장소 편집"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>업데이트: {repo.lastUpdate}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => openRepository(repo.url)}
                  className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                  aria-label="저장소 열기"
                >
                  <ExternalLink className="w-3 h-3" />
                  열기
                </button>
                <button
                  onClick={() => copyRepositoryUrl(repo.url)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="URL 복사"
                >
                  복사
                </button>
              </div>
            </div>

            {/* 편집 폼 */}
            {isEditMode && state.editingRepo === repo.id && (
              <div className="mt-3 p-2 bg-white rounded border space-y-2">
                <input
                  type="text"
                  value={repo.name}
                  onChange={(e) => updateRepository(repo.id, { name: e.target.value })}
                  className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                  placeholder="저장소 이름"
                  aria-label="저장소 이름"
                />
                <input
                  type="text"
                  value={repo.description}
                  onChange={(e) => updateRepository(repo.id, { description: e.target.value })}
                  className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                  placeholder="설명"
                  aria-label="저장소 설명"
                />
                <div className="flex gap-2">
                  <select
                    value={repo.language}
                    onChange={(e) => updateRepository(repo.id, { language: e.target.value })}
                    className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded"
                    aria-label="프로그래밍 언어"
                  >
                    {Object.keys(LANGUAGE_COLORS).map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={repo.private}
                      onChange={(e) => updateRepository(repo.id, { private: e.target.checked })}
                      className="w-3 h-3"
                    />
                    비공개
                  </label>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-6 text-xs"
                    onClick={() => setState(prev => ({ ...prev, editingRepo: null }))}
                  >
                    완료
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-6 text-xs text-red-600 hover:text-red-700"
                    onClick={() => deleteRepository(repo.id)}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 저장소 추가 */}
      {isEditMode && (
        <div className="mt-3">
          {!state.showAddForm ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full h-6 text-xs"
              onClick={() => setState(prev => ({ ...prev, showAddForm: true }))}
            >
              <Plus className="w-3 h-3 mr-1" />
              저장소 추가
            </Button>
          ) : (
            <div className="space-y-2 p-2 bg-gray-50 rounded">
              <input
                type="text"
                value={state.newRepo.name || ''}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  newRepo: { ...prev.newRepo, name: e.target.value }
                }))}
                placeholder="저장소 이름"
                className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                aria-label="새 저장소 이름"
              />
              <input
                type="text"
                value={state.newRepo.description || ''}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  newRepo: { ...prev.newRepo, description: e.target.value }
                }))}
                placeholder="설명 (선택사항)"
                className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                aria-label="새 저장소 설명"
              />
              <div className="flex gap-2">
                <select
                  value={state.newRepo.language || 'TypeScript'}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    newRepo: { ...prev.newRepo, language: e.target.value }
                  }))}
                  className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded"
                  aria-label="프로그래밍 언어"
                >
                  {Object.keys(LANGUAGE_COLORS).map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={state.newRepo.private || false}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      newRepo: { ...prev.newRepo, private: e.target.checked }
                    }))}
                    className="w-3 h-3"
                  />
                  비공개
                </label>
              </div>
              <input
                type="url"
                value={state.newRepo.url || ''}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  newRepo: { ...prev.newRepo, url: e.target.value }
                }))}
                placeholder="https://github.com/username/repository"
                className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                aria-label="저장소 URL"
              />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  className="flex-1 h-6 text-xs"
                  onClick={addRepository}
                >
                  추가
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-6 text-xs"
                  onClick={() => setState(prev => ({ 
                    ...prev, 
                    showAddForm: false,
                    newRepo: { language: 'TypeScript', private: false }
                  }))}
                >
                  취소
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 빈 상태 */}
      {state.repositories.length === 0 && (
        <div className="text-center text-gray-500 text-xs py-8">
          <div className="text-2xl mb-2">📁</div>
          <div>저장소가 없습니다.</div>
          <div className="text-gray-400 mt-1">편집 모드에서 저장소를 추가해보세요.</div>
        </div>
      )}

      {/* GitHub 바로가기 */}
      <Button 
        size="sm" 
        variant="outline" 
        className="w-full h-6 text-xs mt-3"
        onClick={() => window.open('https://github.com', '_blank', 'noopener,noreferrer')}
        aria-label="GitHub 웹사이트 열기"
      >
        <Github className="w-3 h-3 mr-1" />
        GitHub 바로가기
      </Button>
    </div>
  );
};
