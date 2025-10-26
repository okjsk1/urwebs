import React, { useState } from 'react';
import { X, Copy, Eye, EyeOff, Globe, Link, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { trackEvent, ANALYTICS_EVENTS } from '../../utils/analytics';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
  pageTitle: string;
  onTemplateSave?: (templateData: any) => void;
}

type ShareMode = 'private' | 'unlisted' | 'public';

export function ShareModal({ isOpen, onClose, pageId, pageTitle, onTemplateSave }: ShareModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [shareMode, setShareMode] = useState<ShareMode>('private');
  const [shareToken, setShareToken] = useState<string>('');
  const [templateData, setTemplateData] = useState({
    title: pageTitle,
    description: '',
    tags: [] as string[],
    removePersonalInfo: true,
    removeTokens: true,
    removeNotes: true,
    ogImage: ''
  });
  const [piiWarnings, setPiiWarnings] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleModeSelect = (mode: ShareMode) => {
    setShareMode(mode);
    trackEvent(ANALYTICS_EVENTS.SHARE_CLICK, { mode });
    
    if (mode === 'unlisted') {
      // 토큰 생성 (실제로는 서버에서 생성)
      setShareToken(`urwebs.com/p/${pageId}?t=${Math.random().toString(36).substr(2, 9)}`);
    }
  };

  const handleCopyLink = () => {
    const link = shareMode === 'private' 
      ? `urwebs.com/p/${pageId}` 
      : shareToken;
    
    navigator.clipboard.writeText(link);
    // TODO: 토스트 알림
  };

  const handleTemplateSave = () => {
    // PII 감지 로직 (간단한 예시)
    const warnings: string[] = [];
    if (templateData.title.includes('@')) warnings.push('이메일 주소가 포함되어 있습니다');
    if (templateData.description.includes('010-')) warnings.push('전화번호가 포함되어 있습니다');
    setPiiWarnings(warnings);

    if (warnings.length > 0 && !templateData.removePersonalInfo) {
      alert('개인정보가 포함되어 있습니다. 제거 옵션을 선택하거나 내용을 수정해주세요.');
      return;
    }

    // 템플릿 저장
    onTemplateSave?.(templateData);
    trackEvent('template_saved', { template_id: pageId, mode: shareMode });
    onClose();
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">페이지 공유하기</h2>
        <p className="text-gray-600">공유 방식을 선택하세요</p>
      </div>

      <div className="space-y-4">
        {/* Private */}
        <div 
          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
            shareMode === 'private' 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleModeSelect('private')}
        >
          <div className="flex items-start gap-3">
            <Shield className={`w-6 h-6 ${shareMode === 'private' ? 'text-indigo-600' : 'text-gray-400'}`} />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">비공개 (Private)</h3>
              <p className="text-sm text-gray-600 mt-1">링크를 아는 사람만 접근 가능</p>
            </div>
            {shareMode === 'private' && <CheckCircle className="w-5 h-5 text-indigo-600" />}
          </div>
        </div>

        {/* Unlisted */}
        <div 
          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
            shareMode === 'unlisted' 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleModeSelect('unlisted')}
        >
          <div className="flex items-start gap-3">
            <Link className={`w-6 h-6 ${shareMode === 'unlisted' ? 'text-indigo-600' : 'text-gray-400'}`} />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">링크 공유 (Unlisted)</h3>
              <p className="text-sm text-gray-600 mt-1">토큰 링크로만 접근 가능</p>
            </div>
            {shareMode === 'unlisted' && <CheckCircle className="w-5 h-5 text-indigo-600" />}
          </div>
        </div>

        {/* Public */}
        <div 
          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
            shareMode === 'public' 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleModeSelect('public')}
        >
          <div className="flex items-start gap-3">
            <Globe className={`w-6 h-6 ${shareMode === 'public' ? 'text-indigo-600' : 'text-gray-400'}`} />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">공개 (Public)</h3>
              <p className="text-sm text-gray-600 mt-1">검색 및 갤러리에 노출</p>
            </div>
            {shareMode === 'public' && <CheckCircle className="w-5 h-6 text-indigo-600" />}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          취소
        </button>
        <button
          onClick={() => setCurrentStep(2)}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          다음
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">공유 링크</h2>
        <p className="text-gray-600">생성된 링크를 복사하여 공유하세요</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={shareMode === 'unlisted' ? shareToken : `urwebs.com/p/${pageId}`}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
          />
          <button
            onClick={handleCopyLink}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            복사
          </button>
        </div>
      </div>

      {shareMode === 'public' && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">공개 모드 안내</h4>
              <p className="text-sm text-blue-700 mt-1">
                이 페이지는 검색 결과와 템플릿 갤러리에 노출됩니다. 
                개인정보나 민감한 정보가 포함되어 있지 않은지 확인해주세요.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          이전
        </button>
        {shareMode === 'public' ? (
          <button
            onClick={() => setCurrentStep(3)}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            템플릿으로 저장
          </button>
        ) : (
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            완료
          </button>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">템플릿으로 저장</h2>
        <p className="text-gray-600">다른 사용자들이 복제할 수 있는 템플릿을 만들어보세요</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">템플릿 제목</label>
          <input
            type="text"
            value={templateData.title}
            onChange={(e) => setTemplateData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            placeholder="템플릿 제목을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
          <textarea
            value={templateData.description}
            onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            rows={3}
            placeholder="템플릿에 대한 설명을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>
          <input
            type="text"
            value={templateData.tags.join(', ')}
            onChange={(e) => setTemplateData(prev => ({ 
              ...prev, 
              tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            placeholder="개발자, 디자인, 학생 (쉼표로 구분)"
          />
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">개인정보 제거 옵션</h4>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={templateData.removePersonalInfo}
              onChange={(e) => setTemplateData(prev => ({ ...prev, removePersonalInfo: e.target.checked }))}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-200"
            />
            <span className="text-sm text-gray-700">이메일, 전화번호 등 개인정보 자동 제거</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={templateData.removeTokens}
              onChange={(e) => setTemplateData(prev => ({ ...prev, removeTokens: e.target.checked }))}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-200"
            />
            <span className="text-sm text-gray-700">API 키, 토큰 등 민감한 정보 제거</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={templateData.removeNotes}
              onChange={(e) => setTemplateData(prev => ({ ...prev, removeNotes: e.target.checked }))}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-200"
            />
            <span className="text-sm text-gray-700">개인 메모 및 노트 제거</span>
          </label>
        </div>

        {piiWarnings.length > 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900">개인정보 감지됨</h4>
                <ul className="text-sm text-yellow-700 mt-1">
                  {piiWarnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep(2)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          이전
        </button>
        <button
          onClick={handleTemplateSave}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          템플릿 저장
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full ${
                    step <= currentStep ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">{currentStep}/3</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
    </div>
  );
}
