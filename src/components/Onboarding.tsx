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
    id: 'template',
    title: '1단계 · 템플릿 선택',
    description: '홈 화면의 "템플릿으로 새로 만들기" 버튼을 눌러 시작해보세요. 취향에 맞는 템플릿을 고르면 기본 위젯이 자동으로 배치됩니다.'
  },
  {
    id: 'widget',
    title: '2단계 · 위젯 추가',
    description: '마이페이지 상단의 "+ 위젯 추가" 버튼을 눌러 필요한 기능을 더해보세요. 첫 번째 위젯을 추가할 때 하이라이트로 안내가 제공됩니다.'
  },
  {
    id: 'save',
    title: '3단계 · 저장하기',
    description: '우측 상단의 "저장하기" 버튼을 누르면 임시 페이지도 로컬에 저장됩니다. 로그인 후에는 언제든지 내 계정으로 동기화할 수 있어요.'
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

