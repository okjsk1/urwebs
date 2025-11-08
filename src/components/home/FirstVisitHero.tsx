import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Sparkles, Wand2 } from 'lucide-react';
import { TutorialProgress } from '../../hooks/useTutorialProgress';
import { TutorialStepper } from './TutorialStepper';

interface FirstVisitHeroProps {
  progress: TutorialProgress | null;
  onStartTrial: () => void;
  visitCount?: number;
}

export const FirstVisitHero: React.FC<FirstVisitHeroProps> = ({ progress, onStartTrial, visitCount }) => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-indigo-900/60 dark:via-gray-900 dark:to-purple-900/40 border border-white/60 dark:border-gray-800 shadow-2xl shadow-indigo-500/20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-10 w-72 h-72 bg-purple-400/30 dark:bg-purple-500/20 blur-3xl rounded-full" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-500/20 blur-3xl rounded-full" />
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 p-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 dark:bg-gray-900/60 px-4 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-300 shadow-sm">
            <Sparkles className="w-4 h-4" />
            URWEBS 첫 방문 체험
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            <span className="block text-gray-800 dark:text-indigo-100">환영합니다!</span>
            <span className="block mt-1">
              <span className="relative inline-flex">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="px-3 py-1 rounded-2xl bg-white/70 dark:bg-gray-900/70 text-indigo-600 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-200/70 dark:ring-indigo-500/40"
                >
                  나만의 시작페이지
                </motion.span>
              </span>
              를 만들어보세요!
            </span>
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
            템플릿을 고르고, 위젯을 추가하고, 저장하면 끝! 로그인 없이도 바로 나만의 대시보드를 체험해볼 수 있어요.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onStartTrial}
              className="group inline-flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 font-semibold shadow-lg shadow-indigo-500/30 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400"
            >
              1분 만에 체험 시작하기
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-600/80 dark:text-gray-300/80">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              설치 없이 바로 사용 가능합니다.
            </div>
          </div>

          <AnimatePresence>
            {!progress?.completedAt && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <TutorialStepper progress={progress} />
              </motion.div>
            )}
          </AnimatePresence>

          {visitCount && visitCount > 1 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              이전에 방문하셨나요? 임시 페이지는 자동으로 저장되어 있습니다. `내 페이지로 가기`에서 이어서 편집하세요.
            </p>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200/30 to-purple-200/30 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-3xl blur-2xl" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-3xl border border-white/80 dark:border-gray-800 bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Live Preview</p>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">체험 페이지 미리보기</h3>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-600 dark:text-indigo-300">
                <Wand2 className="w-3.5 h-3.5" />
                자동 생성
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-white/90 to-indigo-50/60 dark:from-gray-900/60 dark:to-indigo-900/30 border border-indigo-100/70 dark:border-gray-800 shadow-inner p-5 space-y-4">
              <div className="rounded-xl bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-800 dark:text-gray-100">매일 방문하는 사이트</div>
                  <span className="text-xs text-gray-400">북마크</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm text-gray-700 dark:text-gray-200">
                  <div className="rounded-xl bg-indigo-50 dark:bg-indigo-500/10 px-3 py-2 shadow-sm">URWEBS 가이드</div>
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 shadow-sm">Notion</div>
                  <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 px-3 py-2 shadow-sm">YouTube</div>
                </div>
              </div>
              <div className="rounded-xl bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-gray-800 dark:text-gray-100">오늘의 할 일</div>
                  <span className="text-xs text-gray-400">To-do</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-indigo-400" />
                    <span className="text-gray-700 dark:text-gray-200">프로젝트 아이디어 정리</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-gray-700 dark:text-gray-200">팀 공유용 링크 정리</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-rose-400" />
                    <span className="text-gray-700 dark:text-gray-200">디자인 참고 사이트 저장</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-sky-200/80 to-blue-500/70 text-white shadow-inner px-4 py-5">
                <div className="text-xs uppercase tracking-wide opacity-80">Weather</div>
                <div className="mt-1 flex items-end gap-4">
                  <div className="text-4xl font-semibold">18°</div>
                  <div>
                    <p className="text-sm font-medium">서울 · 맑음</p>
                    <p className="text-xs opacity-80">체감 17° · 미세먼지 좋음</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>로그인 없이 임시 페이지로 저장됩니다.</span>
              <span>Step {progress?.steps?.save?.status === 'completed' ? '3/3 완료' : '1/3 진행 중'}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

