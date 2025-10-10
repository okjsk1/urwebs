// 리팩터링된 SocialWidgets - 소셜 미디어 관리, QR 코드, 접근성
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Share2, Plus, Settings, QrCode, Copy } from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  url: string;
  icon: string;
  followers: number;
  color: string;
  isPublic: boolean;
  displayOrder: number;
  lastActivity?: string;
}

interface SocialState {
  accounts: SocialAccount[];
  showAddForm: boolean;
  newAccount: Partial<SocialAccount>;
  editingAccount: string | null;
  showQRCode: boolean;
  selectedAccountForQR: string | null;
  profileSettings: {
    showFollowers: boolean;
    showActivity: boolean;
    layoutStyle: 'grid' | 'list';
    theme: 'default' | 'minimal' | 'colorful';
  };
}

const PLATFORM_CONFIGS = {
  instagram: { icon: '📷', color: 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700', name: 'Instagram' },
  twitter: { icon: '🐦', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700', name: 'Twitter' },
  x: { icon: '🐦', color: 'bg-black hover:bg-gray-800 border-gray-800 text-white', name: 'X' },
  linkedin: { icon: '💼', color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700', name: 'LinkedIn' },
  youtube: { icon: '📺', color: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700', name: 'YouTube' },
  facebook: { icon: '📘', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700', name: 'Facebook' },
  tiktok: { icon: '🎵', color: 'bg-black hover:bg-gray-800 border-gray-800 text-white', name: 'TikTok' },
  github: { icon: '🐙', color: 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700', name: 'GitHub' },
  discord: { icon: '💬', color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700', name: 'Discord' },
  telegram: { icon: '✈️', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700', name: 'Telegram' }
};

const DEFAULT_ACCOUNTS: SocialAccount[] = [
  {
    id: '1',
    platform: 'instagram',
    username: '@myusername',
    url: 'https://instagram.com/myusername',
    icon: '📷',
    followers: 1250,
    color: 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700',
    isPublic: true,
    displayOrder: 1,
    lastActivity: '2시간 전'
  },
  {
    id: '2',
    platform: 'twitter',
    username: '@myusername',
    url: 'https://twitter.com/myusername',
    icon: '🐦',
    followers: 890,
    color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700',
    isPublic: true,
    displayOrder: 2,
    lastActivity: '1일 전'
  },
  {
    id: '3',
    platform: 'linkedin',
    username: 'My Name',
    url: 'https://linkedin.com/in/myusername',
    icon: '💼',
    followers: 567,
    color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700',
    isPublic: true,
    displayOrder: 3,
    lastActivity: '3일 전'
  },
  {
    id: '4',
    platform: 'youtube',
    username: 'My Channel',
    url: 'https://youtube.com/@mychannel',
    icon: '📺',
    followers: 2340,
    color: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700',
    isPublic: false,
    displayOrder: 4,
    lastActivity: '1주 전'
  }
];

export const SocialWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<SocialState>(() => {
    const saved = readLocal(widget.id, {
      accounts: DEFAULT_ACCOUNTS,
      showAddForm: false,
      newAccount: { isPublic: true },
      editingAccount: null,
      showQRCode: false,
      selectedAccountForQR: null,
      profileSettings: {
        showFollowers: true,
        showActivity: true,
        layoutStyle: 'grid',
        theme: 'default'
      }
    });
    // accounts가 배열인지 확인하고 아니면 기본값 사용
    return {
      ...saved,
      accounts: Array.isArray(saved.accounts) ? saved.accounts : DEFAULT_ACCOUNTS
    };
  });

  // 상태 저장
  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, updateWidget]);

  const getPlatformConfig = (platform: string) => {
    const normalizedPlatform = platform.toLowerCase();
    return PLATFORM_CONFIGS[normalizedPlatform as keyof typeof PLATFORM_CONFIGS] || {
      icon: '🔗',
      color: 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700',
      name: platform
    };
  };

  const addAccount = useCallback(() => {
    const { platform, username, url, followers } = state.newAccount;
    
    if (!platform?.trim()) {
      showToast('플랫폼을 입력하세요', 'error');
      return;
    }
    
    if (!username?.trim()) {
      showToast('사용자명을 입력하세요', 'error');
      return;
    }
    
    if (!url?.trim()) {
      showToast('URL을 입력하세요', 'error');
      return;
    }

    // URL 유효성 검사
    try {
      new URL(url);
    } catch {
      showToast('올바른 URL을 입력하세요', 'error');
      return;
    }

    const duplicate = state.accounts.find(account => 
      account.platform.toLowerCase() === platform.toLowerCase() ||
      account.url === url
    );
    if (duplicate) {
      showToast('이미 존재하는 계정입니다', 'error');
      return;
    }

    const config = getPlatformConfig(platform);
    const newAccount: SocialAccount = {
      id: Date.now().toString(),
      platform: platform.trim(),
      username: username.trim(),
      url: url.trim(),
      icon: config.icon,
      followers: followers || 0,
      color: config.color,
      isPublic: state.newAccount.isPublic !== false,
      displayOrder: state.accounts.length + 1,
      lastActivity: '방금 전'
    };

    setState(prev => ({
      ...prev,
      accounts: [...prev.accounts, newAccount],
      newAccount: { isPublic: true },
      showAddForm: false
    }));
    showToast('소셜 계정이 추가되었습니다', 'success');
  }, [state.newAccount, state.accounts]);

  const updateAccount = useCallback((id: string, updates: Partial<SocialAccount>) => {
    setState(prev => ({
      ...prev,
      accounts: prev.accounts.map(account => 
        account.id === id ? { ...account, ...updates } : account
      ),
      editingAccount: null
    }));
    showToast('계정 정보가 업데이트되었습니다', 'success');
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      accounts: prev.accounts.filter(account => account.id !== id)
    }));
    showToast('계정이 삭제되었습니다', 'success');
  }, []);

  const openAccount = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const copyAccountUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    showToast('URL이 복사되었습니다', 'success');
  }, []);

  const shareProfile = useCallback(async () => {
    const profileUrl = window.location.href;
    const profileText = `내 소셜 미디어 프로필을 확인해보세요! ${state.accounts.length}개의 계정이 있습니다.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '내 소셜 미디어 프로필',
          text: profileText,
          url: profileUrl
        });
      } catch (error) {
        // 사용자가 공유를 취소한 경우
      }
    } else {
      navigator.clipboard.writeText(profileUrl);
      showToast('프로필 링크가 복사되었습니다', 'success');
    }
  }, [state.accounts.length]);

  const generateQRCode = useCallback((account: SocialAccount) => {
    // 실제로는 QR 코드 라이브러리를 사용해야 하지만, 여기서는 시뮬레이션
    const mockQRCode = `
    ████████████████████████████████
    ██                          ██
    ██  ██████  ██████  ██████  ██
    ██  ██  ██  ██  ██  ██  ██  ██
    ██  ██████  ██████  ██████  ██
    ██                          ██
    ██  ██████  ██████  ██████  ██
    ██  ██  ██  ██  ██  ██  ██  ██
    ██  ██████  ██████  ██████  ██
    ██                          ██
    ████████████████████████████████
    `;
    
    setState(prev => ({
      ...prev,
      showQRCode: true,
      selectedAccountForQR: account.id
    }));
    
    showToast(`${account.platform} QR 코드를 생성했습니다`, 'success');
  }, []);

  const sortedAccounts = useMemo(() => {
    return [...state.accounts].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [state.accounts]);

  const publicAccounts = useMemo(() => {
    return sortedAccounts.filter(account => account.isPublic);
  }, [sortedAccounts]);

  const totalFollowers = useMemo(() => {
    return state.accounts.reduce((sum, account) => sum + account.followers, 0);
  }, [state.accounts]);

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="p-3">
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">👥</div>
        <h4 className="font-semibold text-sm text-gray-800">소셜 미디어</h4>
        <p className="text-xs text-gray-500">
          {publicAccounts.length}개 공개 계정 • 총 {formatFollowers(totalFollowers)} 팔로워
        </p>
      </div>

      {/* 프로필 공유 및 설정 */}
      <div className="mb-3 flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 h-6 text-xs"
          onClick={shareProfile}
          aria-label="프로필 공유"
        >
          <Share2 className="w-3 h-3 mr-1" />
          공유
        </Button>
        {isEditMode && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-xs"
            onClick={() => setState(prev => ({ ...prev, showQRCode: !prev.showQRCode }))}
            aria-label="QR 코드 보기"
          >
            <QrCode className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* QR 코드 모달 */}
      {state.showQRCode && state.selectedAccountForQR && (
        <div className="mb-3 p-2 bg-gray-50 rounded">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-600">QR 코드</span>
            <button
              onClick={() => setState(prev => ({ ...prev, showQRCode: false, selectedAccountForQR: null }))}
              className="text-gray-500 hover:text-gray-700"
              aria-label="QR 코드 닫기"
            >
              ×
            </button>
          </div>
          <div className="bg-white p-2 rounded text-center">
            <pre className="text-xs font-mono leading-tight" aria-label="QR 코드">
              ████████████████████████████████
              ██                          ██
              ██  ██████  ██████  ██████  ██
              ██  ██  ██  ██  ██  ██  ██  ██
              ██  ██████  ██████  ██████  ██
              ██                          ██
              ████████████████████████████████
            </pre>
            <div className="text-xs text-gray-500 mt-1">스캔하여 프로필 열기</div>
          </div>
        </div>
      )}

      {/* 소셜 계정 목록 */}
      <div className={`space-y-2 ${state.profileSettings.layoutStyle === 'grid' ? 'grid grid-cols-1' : ''}`}>
        {sortedAccounts.map(account => (
          <div key={account.id} className="relative">
            <button
              onClick={() => openAccount(account.url)}
              className={`w-full p-3 rounded-lg border transition-colors ${account.color}`}
              aria-label={`${account.platform} 계정 열기`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-lg">{account.icon}</div>
                  <div className="text-left">
                    <div className="text-sm font-medium">{account.platform}</div>
                    <div className="text-xs opacity-80">{account.username}</div>
                    {state.profileSettings.showActivity && account.lastActivity && (
                      <div className="text-xs opacity-60">{account.lastActivity}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {state.profileSettings.showFollowers && (
                    <>
                      <div className="text-xs font-medium">{formatFollowers(account.followers)}</div>
                      <div className="text-xs opacity-80">팔로워</div>
                    </>
                  )}
                  {!account.isPublic && (
                    <div className="text-xs opacity-60">비공개</div>
                  )}
                </div>
              </div>
            </button>
            
            {/* 편집 모드 컨트롤 */}
            {isEditMode && (
              <div className="absolute top-1 right-1 flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    generateQRCode(account);
                  }}
                  className="w-6 h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  aria-label="QR 코드 생성"
                >
                  <QrCode className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setState(prev => ({ ...prev, editingAccount: account.id }));
                  }}
                  className="w-6 h-6 bg-gray-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  aria-label="계정 편집"
                >
                  <Settings className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAccount(account.id);
                  }}
                  className="w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  aria-label="계정 삭제"
                >
                  ×
                </button>
              </div>
            )}

            {/* 편집 폼 */}
            {isEditMode && state.editingAccount === account.id && (
              <div className="mt-3 p-2 bg-white rounded border space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={account.platform}
                    onChange={(e) => updateAccount(account.id, { platform: e.target.value })}
                    className="text-xs px-2 py-1 border border-gray-300 rounded"
                    placeholder="플랫폼"
                    aria-label="플랫폼"
                  />
                  <input
                    type="text"
                    value={account.username}
                    onChange={(e) => updateAccount(account.id, { username: e.target.value })}
                    className="text-xs px-2 py-1 border border-gray-300 rounded"
                    placeholder="사용자명"
                    aria-label="사용자명"
                  />
                </div>
                <input
                  type="url"
                  value={account.url}
                  onChange={(e) => updateAccount(account.id, { url: e.target.value })}
                  className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                  placeholder="URL"
                  aria-label="계정 URL"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={account.followers}
                    onChange={(e) => updateAccount(account.id, { followers: parseInt(e.target.value) || 0 })}
                    className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded"
                    placeholder="팔로워 수"
                    aria-label="팔로워 수"
                  />
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={account.isPublic}
                      onChange={(e) => updateAccount(account.id, { isPublic: e.target.checked })}
                      className="w-3 h-3"
                    />
                    공개
                  </label>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-6 text-xs"
                    onClick={() => setState(prev => ({ ...prev, editingAccount: null }))}
                  >
                    완료
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-6 text-xs"
                    onClick={() => copyAccountUrl(account.url)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    복사
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 계정 추가 */}
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
              계정 추가
            </Button>
          ) : (
            <div className="space-y-2 p-2 bg-gray-50 rounded">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={state.newAccount.platform || ''}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    newAccount: { ...prev.newAccount, platform: e.target.value }
                  }))}
                  placeholder="플랫폼 (예: Instagram)"
                  className="text-xs px-2 py-1 border border-gray-300 rounded"
                  aria-label="새 플랫폼"
                />
                <input
                  type="text"
                  value={state.newAccount.username || ''}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    newAccount: { ...prev.newAccount, username: e.target.value }
                  }))}
                  placeholder="사용자명"
                  className="text-xs px-2 py-1 border border-gray-300 rounded"
                  aria-label="새 사용자명"
                />
              </div>
              <input
                type="url"
                value={state.newAccount.url || ''}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  newAccount: { ...prev.newAccount, url: e.target.value }
                }))}
                placeholder="프로필 URL"
                className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                aria-label="새 프로필 URL"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={state.newAccount.followers || ''}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    newAccount: { ...prev.newAccount, followers: parseInt(e.target.value) || 0 }
                  }))}
                  placeholder="팔로워 수"
                  className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded"
                  aria-label="새 팔로워 수"
                />
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={state.newAccount.isPublic !== false}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      newAccount: { ...prev.newAccount, isPublic: e.target.checked }
                    }))}
                    className="w-3 h-3"
                  />
                  공개
                </label>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  className="flex-1 h-6 text-xs"
                  onClick={addAccount}
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
                    newAccount: { isPublic: true }
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
      {state.accounts.length === 0 && (
        <div className="text-center text-gray-500 text-xs py-8">
          <div className="text-2xl mb-2">📱</div>
          <div>추가된 소셜 계정이 없습니다.</div>
          <div className="text-gray-400 mt-1">편집 모드에서 계정을 추가해보세요.</div>
        </div>
      )}
    </div>
  );
};
