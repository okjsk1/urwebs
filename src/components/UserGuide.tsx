import React, { useState, useEffect } from 'react';

interface UserGuideProps {
  onClose: () => void; // 가이드 닫기 함수
}

interface GuideStep {
  id: number;
  title: string;
  description: string;
  position: { top: string; left: string; right?: string; bottom?: string };
  arrow: 'top' | 'bottom' | 'left' | 'right';
}

export function UserGuide({ onClose }: UserGuideProps) {
  const [currentStep, setCurrentStep] = useState(0); // 현재 단계
  const [isVisible, setIsVisible] = useState(true); // 가이드 표시 여부

  // 가이드 단계별 정보
  const guideSteps: GuideStep[] = [
    {
      id: 1,
      title: "1단계: 설명 보기 활성화",
      description: "이 버튼을 클릭하면 각 사이트의 상세 설명을 볼 수 있습니다.",
      position: { top: '250px', right: '80px' },
      arrow: 'right'
    },
    {
      id: 2,
      title: "2단계: 즐겨찾기 추가",
      description: "마음에 드는 사이트의 ⭐ 버튼을 클릭하여 즐겨찾기에 추가하세요.",
      position: { top: '350px', left: '50%' },
      arrow: 'top'
    },
    {
      id: 3,
      title: "3단계: 폴더로 드래그",
      description: "즐겨찾기의 사이트를 마우스로 드래그하여 원하는 폴더로 이동시킬 수 있습니다.",
      position: { top: '200px', left: '20px' },
      arrow: 'left'
    },
    {
      id: 4,
      title: "4단계: 폴더 추가",
      description: "'폴더 추가' 버튼으로 새로운 폴더를 만들어 사이트를 체계적으로 정리하세요.",
      position: { top: '180px', left: '20px' },
      arrow: 'left'
    },
    {
      id: 5,
      title: "5단계: 설정 저장",
      description: "로그인하여 나만의 즐겨찾기 설정을 저장하고 언제든 불러올 수 있습니다.",
      position: { top: '180px', left: '20px' },
      arrow: 'left'
    }
  ];

  // 다음 단계로 이동
  const nextStep = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeGuide();
    }
  };

  // 이전 단계로 이동
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 가이드 닫기
  const closeGuide = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // ESC 키로 가이드 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeGuide();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  if (!isVisible) return null;

  const currentGuide = guideSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-300"
        onClick={closeGuide}
      />
      
      {/* 가이드 툴팁 */}
      <div
        className={`absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 p-4 max-w-sm transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          ...currentGuide.position,
          transform: 'translateX(-50%)',
          zIndex: 60
        }}
      >
        {/* 화살표 */}
        <div 
          className={`absolute w-0 h-0 border-8 ${
            currentGuide.arrow === 'top' ? 'border-b-white dark:border-b-gray-800 border-x-transparent border-t-transparent -top-4 left-1/2 -translate-x-1/2' :
            currentGuide.arrow === 'bottom' ? 'border-t-white dark:border-t-gray-800 border-x-transparent border-b-transparent -bottom-4 left-1/2 -translate-x-1/2' :
            currentGuide.arrow === 'left' ? 'border-r-white dark:border-r-gray-800 border-y-transparent border-l-transparent -left-4 top-1/2 -translate-y-1/2' :
            'border-l-white dark:border-l-gray-800 border-y-transparent border-r-transparent -right-4 top-1/2 -translate-y-1/2'
          }`}
        />
        
        {/* 가이드 내용 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentGuide.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {currentGuide.description}
          </p>
          
          {/* 단계 인디케이터 */}
          <div className="flex items-center gap-2">
            {guideSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep 
                    ? 'bg-blue-500' 
                    : index < currentStep 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {/* 버튼들 */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={closeGuide}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
              >
                건너뛰기
              </button>
              <button
                onClick={nextStep}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {currentStep === guideSteps.length - 1 ? '완료' : '다음'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 애니메이션 효과 - 드래그 시연 (3단계에서) */}
      {currentStep === 2 && (
        <div className="absolute top-32 left-10 animate-pulse">
          <div className="flex items-center text-blue-500">
            <span className="text-2xl">👆</span>
            <svg 
              className="w-16 h-8 ml-2" 
              viewBox="0 0 64 32" 
              fill="none"
            >
              <path 
                d="M8 16 L56 16" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeDasharray="4 4"
                className="animate-pulse"
              />
              <path 
                d="M48 8 L56 16 L48 24" 
                stroke="currentColor" 
                strokeWidth="2"
              />
            </svg>
            <span className="text-lg ml-2">📁</span>
          </div>
        </div>
      )}
    </div>
  );
}