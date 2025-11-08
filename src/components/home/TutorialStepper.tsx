import React from 'react';
import { Check, Sparkles, Wand2 } from 'lucide-react';
import { TutorialProgress, TutorialStepId } from '../../hooks/useTutorialProgress';

const STEP_COPY: Record<
  TutorialStepId,
  {
    title: string;
    description: string;
  }
> = {
  template: {
    title: '템플릿 선택',
    description: '테마를 고르면 기본 위젯 구성이 자동으로 배치돼요.'
  },
  widget: {
    title: '위젯 추가',
    description: '원하는 기능을 드래그 앤 드롭으로 자유롭게 배치하세요.'
  },
  save: {
    title: '저장하기',
    description: '한 번의 저장으로 어디서든 내 시작페이지를 열 수 있어요.'
  }
};

const ORDER: TutorialStepId[] = ['template', 'widget', 'save'];

const statusToClasses = (status: 'pending' | 'current' | 'completed') => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-100/60 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500 text-emerald-900 dark:text-emerald-100';
    case 'current':
      return 'bg-indigo-100/70 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500 text-indigo-900 dark:text-indigo-100';
    default:
      return 'bg-white/60 dark:bg-gray-800/40 border-gray-200/70 dark:border-gray-700 text-gray-600 dark:text-gray-300';
  }
};

interface TutorialStepperProps {
  progress: TutorialProgress | null;
}

export const TutorialStepper: React.FC<TutorialStepperProps> = ({ progress }) => {
  const steps = progress?.steps;
  const current = progress?.currentStep;

  return (
    <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-900/50 border border-white/40 dark:border-gray-800/60 rounded-3xl p-6 shadow-lg shadow-indigo-500/10 space-y-4 max-w-xl w-full">
      <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300">
        <Wand2 className="w-4 h-4" />
        3단계 가이드
      </div>
      <div className="space-y-3">
        {ORDER.map((step, index) => {
          const status = steps?.[step]?.status ?? (index === 0 ? 'current' : 'pending');
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';

          return (
            <div
              key={step}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 transition-all duration-200 ${statusToClasses(
                status
              )}`}
            >
              <div
                className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border ${
                  isCompleted
                    ? 'border-emerald-400 bg-emerald-500 text-white'
                    : isCurrent
                    ? 'border-indigo-400 bg-indigo-500 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" />
                ) : isCurrent ? (
                  <Sparkles className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-50">{STEP_COPY[step].title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{STEP_COPY[step].description}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        로그인 없이도 체험이 가능합니다. 저장 후 언제든 다시 이어서 편집해보세요.
      </p>
    </div>
  );
};


