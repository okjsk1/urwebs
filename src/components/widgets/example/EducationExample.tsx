// 영어 단어 학습 위젯 사용 예시
import React, { useState } from 'react';
import { EnglishWordsWidget } from '../EnglishWordsWidget';
import { Button } from '../../ui/button';

// 예시 컴포넌트
export const EducationExample: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);

  // 위젯 업데이트 함수 (예시)
  const updateWidget = (widgetId: string, partial: any) => {
    // Widget updated: ${widgetId}
    // 실제 구현에서는 상태 관리 라이브러리나 API 호출
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">영어 단어 학습 위젯 예시</h1>
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            variant={isEditMode ? 'default' : 'outline'}
          >
            {isEditMode ? '편집 완료' : '편집 모드'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 학습 영역 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-3 border-b border-gray-200">
                <h3 className="font-semibold text-sm text-gray-800">영어 단어 학습</h3>
              </div>
              <div className="h-96">
                <EnglishWordsWidget 
                  widget={{ 
                    id: 'education-widget-1', 
                    type: 'english_words',
                    title: '영어 단어 학습'
                  }}
                  isEditMode={isEditMode}
                  updateWidget={updateWidget}
                />
              </div>
            </div>
          </div>

          {/* 사이드바 정보 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-800 mb-3">기능 안내</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>SRS 기반 간격 반복 학습</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>플래시카드/퀴즈 모드</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>레벨별 필터링 (초급/중급/고급)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>정답률 기반 정렬</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>힌트 기능 및 점진적 공개</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>JSON 임포트/익스포트</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>키보드 단축키 지원</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-800 mb-3">키보드 단축키</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">←</kbd> 이전 단어</li>
                <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">→</kbd> 다음 단어</li>
                <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> 퀴즈 답안 제출</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-800 mb-3">SRS 학습법</h3>
              <p className="text-sm text-gray-600">
                간격 반복 학습 시스템으로 기억을 강화합니다. 
                정답을 맞힐수록 복습 간격이 늘어나고, 
                틀리면 기본 간격으로 돌아갑니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-800 mb-2">사용법 안내</h2>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>학습 모드:</strong> 플래시카드로 암기하거나 퀴즈로 테스트하세요</p>
            <p><strong>편집 모드:</strong> 단어 추가/수정/삭제, 검색, 정렬, 임포트/익스포트</p>
            <p><strong>설정:</strong> 레벨 필터, 정렬 기준, 셔플, 중복 처리 정책</p>
            <p><strong>통계:</strong> 전체 정답률, 복습 필요 단어, 마스터 단어 수</p>
            <p><strong>저장:</strong> 모든 데이터는 자동으로 로컬 스토리지에 저장됩니다</p>
          </div>
        </div>
      </div>
    </div>
  );
};
