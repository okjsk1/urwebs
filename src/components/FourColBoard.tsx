import { useState, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface FourColBoardProps {
  tabId: string;
  isEditMode: boolean;
  renderWidget: (itemKey: string) => React.ReactNode;
}

// 기본 레이아웃 정의
const DEFAULT_LAYOUTS: Record<string, Layout[]> = {
  '페이지 1': [
    { i: 'weather', x: 0, y: 0, w: 1, h: 2 },
    { i: 'news', x: 1, y: 0, w: 3, h: 1 },
    { i: 'calendar', x: 2, y: 1, w: 2, h: 2 },
    { i: 'timer', x: 0, y: 2, w: 1, h: 1 },
  ],
  '페이지 2': [
    { i: 'finance', x: 0, y: 0, w: 2, h: 2 },
    { i: 'memo', x: 2, y: 0, w: 2, h: 1 },
  ],
  '페이지 3': [
    { i: 'memo-large', x: 0, y: 0, w: 4, h: 2 },
  ],
};

export function FourColBoard({ tabId, isEditMode, renderWidget }: FourColBoardProps) {
  const [layout, setLayout] = useState<Layout[]>([]);

  // localStorage 키
  const getStorageKey = (tab: string) => `urwebs:board:${tab}:v1`;

  // 레이아웃 로드
  useEffect(() => {
    const storageKey = getStorageKey(tabId);
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        setLayout(JSON.parse(saved));
      } catch (e) {
        console.error('레이아웃 로드 실패:', e);
        setLayout(DEFAULT_LAYOUTS[tabId] || []);
      }
    } else {
      setLayout(DEFAULT_LAYOUTS[tabId] || []);
    }
  }, [tabId]);

  // 레이아웃 변경 핸들러
  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
    
    // localStorage에 저장
    const storageKey = getStorageKey(tabId);
    localStorage.setItem(storageKey, JSON.stringify(newLayout));
  };

  return (
    <div className="px-4 pb-8">
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 4, md: 4, sm: 4, xs: 4, xxs: 4 }}
        rowHeight={90}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        compactType="vertical"
        preventCollision={false}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        draggableHandle=".widget-drag-handle"
        onLayoutChange={handleLayoutChange}
      >
        {layout.map((item) => (
          <div key={item.i} className="widget-item">
            {renderWidget(item.i)}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}






