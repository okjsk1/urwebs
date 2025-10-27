import React, { useState } from 'react';
import { WidgetScroller, DEFAULT_WIDGET_ITEMS, WidgetItem } from '../components/WidgetScroller';
import { WidgetScrollerNative } from '../components/WidgetScrollerNative';
import { Settings, Play, Pause, RotateCcw, Code, Zap } from 'lucide-react';

export function WidgetScrollerDemo() {
  const [speed, setSpeed] = useState(48);
  const [gap, setGap] = useState(16);
  const [autoPlay, setAutoPlay] = useState(true);
  const [pauseOnHover, setPauseOnHover] = useState(true);
  const [loop, setLoop] = useState(true);
  const [snap, setSnap] = useState<"mandatory" | "proximity" | "none">("proximity");
  const [version, setVersion] = useState<'raf' | 'native'>('raf');

  const customItems: WidgetItem[] = [
    ...DEFAULT_WIDGET_ITEMS,
    {
      id: 'custom-1',
      title: '커스텀 위젯 1',
      description: '사용자 정의 위젯 예시',
      badge: '커스텀'
    },
    {
      id: 'custom-2',
      title: '커스텀 위젯 2',
      description: '추가 기능과 도구 모음',
      badge: '도구'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 dark:from-gray-950 dark:to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            WidgetScroller 데모
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            데스크톱 전용 자동 스크롤 위젯 캐러셀입니다. 
            마우스 휠(Shift+Wheel), 키보드 화살표, 네비게이션 버튼으로 조작할 수 있습니다.
          </p>
        </div>

        {/* 컨트롤 패널 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              설정 패널
            </h2>
          </div>

          {/* 버전 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              구현 버전 선택
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setVersion('raf')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  version === 'raf'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Zap className="w-4 h-4" />
                rAF 기반 (기본)
              </button>
              <button
                onClick={() => setVersion('native')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  version === 'native'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Code className="w-4 h-4" />
                네이티브 스크롤
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {version === 'raf' 
                ? 'requestAnimationFrame 기반으로 부드러운 애니메이션 제공'
                : 'CSS scroll-snap과 네이티브 스크롤을 활용한 구현'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 속도 조절 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                스크롤 속도: {speed}px/s
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* 간격 조절 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                카드 간격: {gap}px
              </label>
              <input
                type="range"
                min="8"
                max="32"
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* 스냅 모드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                스냅 모드
              </label>
              <select
                value={snap}
                onChange={(e) => setSnap(e.target.value as "mandatory" | "proximity" | "none")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="proximity">Proximity</option>
                <option value="mandatory">Mandatory</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          {/* 토글 옵션들 */}
          <div className="flex flex-wrap gap-6 mt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPlay}
                onChange={(e) => setAutoPlay(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">자동 재생</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pauseOnHover}
                onChange={(e) => setPauseOnHover(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">호버 시 정지</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={loop}
                onChange={(e) => setLoop(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">무한 루프</span>
            </label>
          </div>
        </div>

        {/* 위젯 스크롤러 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              추천 위젯 ({version === 'raf' ? 'rAF 기반' : '네이티브 스크롤'})
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Shift + 마우스 휠로 수평 스크롤, 화살표 키로 네비게이션, 호버로 일시정지
            </p>
          </div>

          {version === 'raf' ? (
            <WidgetScroller
              items={customItems}
              speed={speed}
              gap={gap}
              autoPlay={autoPlay}
              pauseOnHover={pauseOnHover}
              loop={loop}
              snap={snap}
              className="border border-gray-200 dark:border-gray-700 rounded-xl"
            />
          ) : (
            <WidgetScrollerNative
              items={customItems}
              speed={speed}
              gap={gap}
              autoPlay={autoPlay}
              pauseOnHover={pauseOnHover}
              loop={loop}
              snap={snap}
              className="border border-gray-200 dark:border-gray-700 rounded-xl"
            />
          )}
        </div>

        {/* 사용법 안내 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            사용법 안내
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">마우스 조작</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Shift + 마우스 휠: 수평 스크롤</li>
                <li>• 마우스 호버: 자동 재생 일시정지</li>
                <li>• 좌/우 네비게이션 버튼: 카드 단위 이동</li>
                <li>• 카드 클릭: 새 탭에서 링크 열기</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">키보드 조작</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• ← → 화살표 키: 카드 단위 이동</li>
                <li>• Tab: 포커스 이동</li>
                <li>• Enter/Space: 카드 클릭</li>
                <li>• prefers-reduced-motion 지원</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">성능 최적화</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• rAF 기반 60fps 애니메이션</li>
              <li>• IntersectionObserver로 가시성 감지</li>
              <li>• transform3d 하드웨어 가속</li>
              <li>• 비가시 탭에서 자동 정지</li>
            </ul>
          </div>
        </div>

        {/* 코드 예시 */}
        <div className="mt-8 bg-gray-900 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">사용 예시</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-medium text-blue-400 mb-2">rAF 기반 버전</h4>
              <pre className="text-sm text-gray-300 overflow-x-auto">
                <code>{`import { WidgetScroller, DEFAULT_WIDGET_ITEMS } from './WidgetScroller';

function MyComponent() {
  return (
    <WidgetScroller 
      items={DEFAULT_WIDGET_ITEMS}
      speed={56}
      gap={16}
      autoPlay={true}
      pauseOnHover={true}
      loop={true}
      snap="proximity"
    />
  );
}`}</code>
              </pre>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-green-400 mb-2">네이티브 스크롤 버전</h4>
              <pre className="text-sm text-gray-300 overflow-x-auto">
                <code>{`import { WidgetScrollerNative, DEFAULT_WIDGET_ITEMS } from './WidgetScrollerNative';

function MyComponent() {
  return (
    <WidgetScrollerNative 
      items={DEFAULT_WIDGET_ITEMS}
      speed={56}
      gap={16}
      autoPlay={true}
      pauseOnHover={true}
      loop={true}
      snap="proximity"
    />
  );
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
