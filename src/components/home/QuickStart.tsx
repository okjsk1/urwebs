import React from 'react';
import { CheckCircle, MousePointer, Share2 } from 'lucide-react';

export function QuickStart() {
  const steps = [
    {
      icon: CheckCircle,
      title: "템플릿 선택",
      description: "원하는 템플릿을 선택하세요",
      color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
    },
    {
      icon: MousePointer,
      title: "드래그 배치",
      description: "위젯을 원하는 위치로 이동",
      color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
    },
    {
      icon: Share2,
      title: "공유/임베드",
      description: "링크 하나로 완성된 페이지 공유",
      color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700"
    }
  ];

  return (
    <div className="w-[420px] shrink-0">
      <div className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 border rounded-xl p-4 shadow-sm ${step.color} transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border-2 border-current flex items-center justify-center">
                    <Icon className="w-4 h-4 text-current" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-shrink-0 mt-2">
                    <div className="w-4 h-4 text-gray-400 dark:text-gray-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
