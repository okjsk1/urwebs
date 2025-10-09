// 비밀번호 생성기 위젯 - 고급 보안 옵션, 히스토리, 접근성
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Copy, Eye, EyeOff, RefreshCw, Trash2, Check, X } from 'lucide-react';
import { WidgetProps, persistOrLocal, readLocal, showToast } from './utils/widget-helpers';

interface PasswordSettings {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  customSymbols: string;
}

interface PasswordHistory {
  id: string;
  password: string;
  settings: PasswordSettings;
  createdAt: number;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
}

interface PasswordState {
  currentPassword: string;
  settings: PasswordSettings;
  history: PasswordHistory[];
  showPassword: boolean;
  showSettings: boolean;
  showHistory: boolean;
}

const DEFAULT_SETTINGS: PasswordSettings = {
  length: 12,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: false,
  excludeSimilar: true,
  excludeAmbiguous: false,
  customSymbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

const CHAR_SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  similar: 'il1Lo0O', // 유사한 문자들
  ambiguous: '{}[]()/\\~,;.<>' // 모호한 문자들
};

export const PasswordWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<PasswordState>(() => {
    const saved = readLocal(widget.id, {
      currentPassword: '',
      settings: DEFAULT_SETTINGS,
      history: [],
      showPassword: false,
      showSettings: false,
      showHistory: false
    });
    return saved;
  });

  // 상태 저장
  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, updateWidget]);

  // 비밀번호 강도 계산
  const calculateStrength = useCallback((password: string): 'weak' | 'medium' | 'strong' | 'very-strong' => {
    let score = 0;
    
    // 길이 점수
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    // 문자 종류 점수
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    
    // 복잡성 점수
    if (password.length > 20) score += 1;
    if ((/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password))) {
      score += 1;
    }
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    if (score <= 6) return 'strong';
    return 'very-strong';
  }, []);

  // 비밀번호 생성
  const generatePassword = useCallback(() => {
    let charset = '';
    
    if (state.settings.includeLowercase) {
      charset += state.settings.excludeSimilar 
        ? CHAR_SETS.lowercase.replace(/[il]/g, '') 
        : CHAR_SETS.lowercase;
    }
    
    if (state.settings.includeUppercase) {
      charset += state.settings.excludeSimilar 
        ? CHAR_SETS.uppercase.replace(/[IO]/g, '') 
        : CHAR_SETS.uppercase;
    }
    
    if (state.settings.includeNumbers) {
      charset += state.settings.excludeSimilar 
        ? CHAR_SETS.numbers.replace(/[01]/g, '') 
        : CHAR_SETS.numbers;
    }
    
    if (state.settings.includeSymbols) {
      let symbols = state.settings.customSymbols || CHAR_SETS.symbols;
      if (state.settings.excludeAmbiguous) {
        symbols = symbols.replace(/[{}[\]()/\\~,;.<>]/g, '');
      }
      charset += symbols;
    }

    if (charset === '') {
      showToast('최소 하나의 문자 종류를 선택해주세요', 'error');
      return;
    }

    let newPassword = '';
    for (let i = 0; i < state.settings.length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    const strength = calculateStrength(newPassword);
    const passwordEntry: PasswordHistory = {
      id: Date.now().toString(),
      password: newPassword,
      settings: { ...state.settings },
      createdAt: Date.now(),
      strength
    };

    setState(prev => ({
      ...prev,
      currentPassword: newPassword,
      history: [passwordEntry, ...prev.history.slice(0, 19)] // 최근 20개만 유지
    }));

    showToast('새 비밀번호가 생성되었습니다', 'success');
  }, [state.settings, calculateStrength]);

  const copyPassword = useCallback(() => {
    if (state.currentPassword) {
      navigator.clipboard.writeText(state.currentPassword);
      showToast('비밀번호가 복사되었습니다', 'success');
    }
  }, [state.currentPassword]);

  const copyHistoryPassword = useCallback((password: string) => {
    navigator.clipboard.writeText(password);
    showToast('비밀번호가 복사되었습니다', 'success');
  }, []);

  const deleteHistoryEntry = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      history: prev.history.filter(entry => entry.id !== id)
    }));
    showToast('히스토리가 삭제되었습니다', 'success');
  }, []);

  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      history: []
    }));
    showToast('모든 히스토리가 삭제되었습니다', 'success');
  }, []);

  const updateSetting = useCallback((key: keyof PasswordSettings, value: any) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  }, []);

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'strong': return 'text-blue-600 bg-blue-50';
      case 'very-strong': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStrengthLabel = (strength: string) => {
    switch (strength) {
      case 'weak': return '약함';
      case 'medium': return '보통';
      case 'strong': return '강함';
      case 'very-strong': return '매우 강함';
      default: return '알 수 없음';
    }
  };

  const currentStrength = useMemo(() => 
    state.currentPassword ? calculateStrength(state.currentPassword) : null,
    [state.currentPassword, calculateStrength]
  );

  // 자동 생성 (컴포넌트 마운트 시)
  useEffect(() => {
    if (!state.currentPassword) {
      generatePassword();
    }
  }, [generatePassword, state.currentPassword]);

  return (
    <div className="p-3">
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">🔒</div>
        <h4 className="font-semibold text-sm text-gray-800">비밀번호 생성기</h4>
      </div>
      
      {/* 생성된 비밀번호 */}
      <div className="mb-3">
        <div className="bg-gray-900 text-white p-3 rounded text-center font-mono text-sm break-all relative">
          <div className="min-h-[1.5rem]">
            {state.currentPassword || '비밀번호를 생성해주세요'}
          </div>
          {state.currentPassword && (
            <button
              onClick={() => setState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              aria-label={state.showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {state.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        
        {state.currentPassword && (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {currentStrength && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStrengthColor(currentStrength)}`}>
                  {getStrengthLabel(currentStrength)}
                </span>
              )}
              <span className="text-xs text-gray-500">
                길이: {state.currentPassword.length}
              </span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 text-xs"
              onClick={copyPassword}
            >
              <Copy className="w-3 h-3 mr-1" />
              복사
            </Button>
          </div>
        )}
      </div>

      {/* 설정 옵션 */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">길이: {state.settings.length}</span>
          <input
            type="range"
            min="4"
            max="64"
            value={state.settings.length}
            onChange={(e) => updateSetting('length', parseInt(e.target.value))}
            className="w-24"
            aria-label="비밀번호 길이"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={state.settings.includeLowercase}
              onChange={(e) => updateSetting('includeLowercase', e.target.checked)}
              className="w-3 h-3"
            />
            소문자 (a-z)
          </label>
          
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={state.settings.includeUppercase}
              onChange={(e) => updateSetting('includeUppercase', e.target.checked)}
              className="w-3 h-3"
            />
            대문자 (A-Z)
          </label>
          
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={state.settings.includeNumbers}
              onChange={(e) => updateSetting('includeNumbers', e.target.checked)}
              className="w-3 h-3"
            />
            숫자 (0-9)
          </label>
          
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={state.settings.includeSymbols}
              onChange={(e) => updateSetting('includeSymbols', e.target.checked)}
              className="w-3 h-3"
            />
            특수문자
          </label>
        </div>

        {/* 고급 옵션 */}
        {isEditMode && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">고급 옵션</span>
              <button
                onClick={() => setState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {state.showSettings ? '숨기기' : '보기'}
              </button>
            </div>
            
            {state.showSettings && (
              <div className="space-y-2 p-2 bg-gray-50 rounded">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={state.settings.excludeSimilar}
                    onChange={(e) => updateSetting('excludeSimilar', e.target.checked)}
                    className="w-3 h-3"
                  />
                  유사한 문자 제외 (0, O, l, I)
                </label>
                
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={state.settings.excludeAmbiguous}
                    onChange={(e) => updateSetting('excludeAmbiguous', e.target.checked)}
                    className="w-3 h-3"
                  />
                  모호한 문자 제외 ({ } [ ] ( ) / \)
                </label>
                
                {state.settings.includeSymbols && (
                  <div>
                    <label className="text-xs text-gray-600">사용자 정의 특수문자:</label>
                    <input
                      type="text"
                      value={state.settings.customSymbols}
                      onChange={(e) => updateSetting('customSymbols', e.target.value)}
                      placeholder="!@#$%^&*()"
                      className="w-full text-xs px-2 py-1 border border-gray-300 rounded mt-1"
                      aria-label="사용자 정의 특수문자"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 생성 버튼 */}
      <div className="flex gap-2 mt-3">
        <Button 
          size="sm" 
          className="flex-1 h-8 text-xs"
          onClick={generatePassword}
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          새로 생성
        </Button>
        
        {isEditMode && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => setState(prev => ({ ...prev, showHistory: !prev.showHistory }))}
          >
            <Eye className="w-3 h-3 mr-1" />
            히스토리
          </Button>
        )}
      </div>

      {/* 히스토리 */}
      {state.showHistory && state.history.length > 0 && (
        <div className="mt-3 p-2 bg-gray-50 rounded max-h-40 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-600">생성 히스토리</span>
            <button
              onClick={clearHistory}
              className="text-red-500 hover:text-red-700"
              aria-label="히스토리 전체 삭제"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1">
            {state.history.slice(0, 10).map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-2 bg-white rounded text-xs">
                <div className="flex-1">
                  <div className="font-mono break-all">
                    {state.showPassword ? entry.password : '•'.repeat(entry.password.length)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-1 py-0.5 rounded text-xs ${getStrengthColor(entry.strength)}`}>
                      {getStrengthLabel(entry.strength)}
                    </span>
                    <span className="text-gray-500">
                      {new Date(entry.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => copyHistoryPassword(entry.password)}
                    className="text-blue-500 hover:text-blue-700"
                    aria-label="비밀번호 복사"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteHistoryEntry(entry.id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="히스토리 삭제"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {state.history.length === 0 && state.showHistory && (
        <div className="mt-3 text-center text-gray-500 text-xs py-4">
          <div className="text-lg mb-1">📝</div>
          <div>생성 히스토리가 없습니다.</div>
        </div>
      )}
    </div>
  );
};
