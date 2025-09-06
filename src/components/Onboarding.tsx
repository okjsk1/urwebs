import React, { useEffect, useState } from 'react';

interface OnboardingProps {
  onOpenAddSite: () => void;
  onOpenHomepageGuide: () => void;
  onClose?: () => void;
}

export function Onboarding({
  onOpenAddSite,
  onOpenHomepageGuide,
  onClose,
}: OnboardingProps) {
  const steps = [
    {
      title: '사이트 직접 추가',
      description: '원하는 사이트를 자유롭게 추가해보세요.',
      action: onOpenAddSite,
      actionLabel: '사이트 추가',
    },
    {
      title: '시작페이지 설정',
      description: '자주 쓰는 페이지를 시작페이지로 지정해보세요.',
      action: onOpenHomepageGuide,
      actionLabel: '시작페이지 안내',
    },
    {
      title: '홈 화면 둘러보기',
      description: '홈 화면의 다양한 기능을 확인하세요.',
    },
    {
      title: '완료',
      description: '이제 준비가 완료되었습니다!'
    }
  ];

  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('urwebs-guide-step');
    const idx = saved ? Number(saved) : 0;
    return idx < steps.length ? idx : 0;
  });
  const [checked, setChecked] = useState<boolean[]>(() => {
    try {
      const saved = localStorage.getItem('urwebs-guide-checked');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) {
          return [...arr, ...Array(steps.length - arr.length).fill(false)].slice(0, steps.length);
        }
      }
    } catch (e) {
      /* ignore */
    }
    return Array(steps.length).fill(false);
  });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    localStorage.setItem('urwebs-guide-step', String(step));
    localStorage.setItem('urwebs-guide-checked', JSON.stringify(checked));
  }, [step, checked]);

  const close = () => {
    localStorage.setItem('urwebs-onboarding-v1', 'done');
    setVisible(false);
    onClose && onClose();
  };

  const handleNext = () => {
    setChecked((prev) => {
      const arr = [...prev];
      arr[step] = true;
      return arr;
    });
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      localStorage.removeItem('urwebs-guide-step');
      localStorage.removeItem('urwebs-guide-checked');
      close();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSkip = () => {
    close();
  };

  if (!visible) return null;

  const current = steps[step];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      aria-label="온보딩"
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
          {current.title}
        </h2>
        <p className="text-sm mb-4 text-gray-700 dark:text-gray-200">
          {current.description}
        </p>

        <label className="flex items-center gap-2 mb-4 text-sm">
          <input
            type="checkbox"
            checked={checked[step] || false}
            onChange={(e) => {
              const arr = [...checked];
              arr[step] = e.target.checked;
              setChecked(arr);
            }}
          />
          이 단계 완료
        </label>

        {current.action && (
          <div className="mb-4">
            <button
              onClick={current.action}
              className="px-3 py-1 bg-[var(--main-point)] text-white text-xs rounded"
              type="button"
              aria-label={current.actionLabel}
            >
              {current.actionLabel}
            </button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className="px-2 py-1 text-xs rounded border disabled:opacity-50"
            style={{ borderColor: 'var(--border-urwebs)' }}
            aria-label="이전"
            type="button"
          >
            이전
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="px-2 py-1 text-xs rounded border"
              style={{ borderColor: 'var(--border-urwebs)' }}
              aria-label="스킵"
              type="button"
            >
              스킵
            </button>
            <button
              onClick={handleNext}
              className="px-2 py-1 text-xs rounded bg-[var(--main-point)] text-white"
              aria-label={step === steps.length - 1 ? '완료' : '다음'}
              type="button"
            >
              {step === steps.length - 1 ? '완료' : '다음'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;

