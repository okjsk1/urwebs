import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X, CheckCircle } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
}

interface OnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'URWEBS에 오신 것을 환영합니다! 🎉',
    description: '개인화된 웹 페이지를 쉽게 만들 수 있는 플랫폼입니다. 간단한 가이드를 따라해보세요!'
  },
  {
    id: 'templates',
    title: '템플릿 선택하기',
    description: '다양한 템플릿 중에서 원하는 스타일을 선택하세요. 비즈니스, 학생, 창작자용 등 다양한 옵션이 있습니다.'
  },
  {
    id: 'widgets',
    title: '위젯 추가하기',
    description: '북마크, 할일, 캘린더, 날씨 등 다양한 위젯을 드래그 앤 드롭으로 쉽게 추가할 수 있습니다.'
  },
  {
    id: 'customize',
    title: '개인화하기',
    description: '위젯의 크기와 위치를 자유롭게 조정하고, 다크모드도 지원합니다.'
  },
  {
    id: 'share',
    title: '공유하기',
    description: '완성된 페이지를 공개하여 다른 사람들과 공유할 수 있습니다.'
  }
];

export function Onboarding({ isOpen, onClose, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsCompleted(false);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6">
        {!isCompleted ? (
          <>
            {/* 진행 표시 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index <= currentStep 
                        ? 'bg-blue-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 내용 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {onboardingSteps[currentStep].title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {onboardingSteps[currentStep].description}
              </p>
            </div>

            {/* 네비게이션 */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                {currentStep + 1} / {onboardingSteps.length}
              </div>

              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1"
              >
                {currentStep === onboardingSteps.length - 1 ? '완료' : '다음'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          /* 완료 화면 */
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              가이드 완료! 🎉
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              이제 URWEBS를 자유롭게 사용해보세요!
            </p>
            <button
              onClick={handleComplete}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

