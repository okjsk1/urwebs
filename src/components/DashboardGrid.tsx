import React from 'react';

type GridWidget = {
  id: string;
  type: string;
  size: { w: number; h: number }; // 예: { w:1, h:2 } = 1x2
  [key: string]: any;
};

interface DashboardGridProps {
  widgets: GridWidget[];
  renderWidget: (w: GridWidget) => any;
  cell?: number;
  className?: string;
  onAddWidget?: () => void;
  showAddButton?: boolean;
  responsiveCells?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export default function DashboardGrid({
  widgets,
  renderWidget,
  cell = 128, // 기본 셀 높이(px): 96~160 사이 조절 가능
  className = '',
  onAddWidget,
  showAddButton = false,
  responsiveCells = {
    default: 112, // 모바일
    sm: 120,     // 작은 화면
    md: 128,     // 중간 화면
    lg: 136,     // 큰 화면
    xl: 144      // 매우 큰 화면
  }
}: DashboardGridProps) {
  // 반응형 CSS 변수 생성
  const generateResponsiveStyles = () => {
    const baseHeight = responsiveCells.default;
    const styles: any = {
      '--grid-row-height': `${baseHeight}px`,
      '--grid-row-height-sm': `${responsiveCells.sm || baseHeight}px`,
      '--grid-row-height-md': `${responsiveCells.md || baseHeight}px`,
      '--grid-row-height-lg': `${responsiveCells.lg || baseHeight}px`,
      '--grid-row-height-xl': `${responsiveCells.xl || baseHeight}px`,
      gridAutoRows: 'var(--grid-row-height)'
    };
    return styles;
  };

  return (
    <>
      <style>
        {`
          .responsive-grid-auto-rows {
            grid-auto-rows: var(--grid-row-height);
          }
          @media (min-width: 640px) {
            .responsive-grid-auto-rows {
              grid-auto-rows: var(--grid-row-height-sm);
            }
          }
          @media (min-width: 768px) {
            .responsive-grid-auto-rows {
              grid-auto-rows: var(--grid-row-height-md);
            }
          }
          @media (min-width: 1024px) {
            .responsive-grid-auto-rows {
              grid-auto-rows: var(--grid-row-height-lg);
            }
          }
          @media (min-width: 1280px) {
            .responsive-grid-auto-rows {
              grid-auto-rows: var(--grid-row-height-xl);
            }
          }
        `}
      </style>
      <div
        className={`responsive-grid-auto-rows grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 ${className}`}
        style={generateResponsiveStyles()}
      >
      {widgets.map((w) => (
        <div
          key={w.id}
          className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
          style={{
            gridColumn: `span ${w.size.w} / span ${w.size.w}`,
            gridRow: `span ${w.size.h} / span ${w.size.h}`,
          }}
        >
          <div className="h-full">
            {renderWidget(w)}
          </div>
        </div>
      ))}
      
      {/* 위젯 추가 버튼 */}
      {showAddButton && onAddWidget && (
        <div
          className="bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer flex items-center justify-center"
          style={{
            gridColumn: 'span 1 / span 1',
            gridRow: 'span 1 / span 1',
          }}
          onClick={onAddWidget}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">+</div>
            <div className="text-sm text-gray-600">위젯 추가</div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

// 사이즈 프리셋 선택 UI
export function SizePicker({ 
  value, 
  onChange,
  widgetType
}: {
  value: { w: number; h: number }; 
  onChange: (v: { w: number; h: number }) => void;
  widgetType?: string;
}) {
  // 위젯 타입에 따른 제한된 크기 옵션
  const getPresetsForWidget = (type?: string) => {
    switch (type) {
      case 'quote': // 영감명언 위젯 - 2x1만 허용
        return [{ label: '2x1', w: 2, h: 1 }];
      case 'google_search':
      case 'naver_search':
      // 검색 위젯들 - 1x1, 2x1만 허용
        return [
          { label: '1x1', w: 1, h: 1 },
          { label: '2x1', w: 2, h: 1 }
        ];
      case 'unified_search': // 통합검색 위젯 - 2x1 허용
        return [{ label: '2x1', w: 2, h: 1 }];
      case 'exchange': // 환율 위젯 - 1칸 너비만 허용
        return [
          { label: '1x1', w: 1, h: 1 },
          { label: '1x2', w: 1, h: 2 },
          { label: '1x3', w: 1, h: 3 },
          { label: '1x4', w: 1, h: 4 }
        ];
      case 'law_search': // 법제처 검색 위젯 - 2x1만 허용
        return [{ label: '2x1', w: 2, h: 1 }];
      case 'todo': // To Do 위젯 - 2칸 너비만 허용
        return [
          { label: '2x2', w: 2, h: 2 },
          { label: '2x3', w: 2, h: 3 },
          { label: '2x4', w: 2, h: 4 }
        ];
      case 'crypto': // 암호화폐 위젯 - 1칸 너비만 허용
        return [
          { label: '1x2', w: 1, h: 2 },
          { label: '1x3', w: 1, h: 3 },
          { label: '1x4', w: 1, h: 4 }
        ];
      case 'qr_code': // QR 접속 위젯 - 1x1만 허용
        return [{ label: '1x1', w: 1, h: 1 }];
      case 'weather': // 날씨 위젯 - 1칸 너비만 허용
        return [
          { label: '1x1', w: 1, h: 1 },
          { label: '1x2', w: 1, h: 2 },
          { label: '1x3', w: 1, h: 3 }
        ];
      case 'bookmark': // 북마크 위젯 - 1칸 너비만 허용
        return [
          { label: '1x2', w: 1, h: 2 },
          { label: '1x3', w: 1, h: 3 },
          { label: '1x4', w: 1, h: 4 }
        ];
      default: // 기본 위젯들 - 모든 크기 허용
        return [
          { label: '1x3', w: 1, h: 3 },
          { label: '1x4', w: 1, h: 4 },
          { label: '2x1', w: 2, h: 1 },
          { label: '2x2', w: 2, h: 2 },
          { label: '2x3', w: 2, h: 3 },
          { label: '3x1', w: 3, h: 1 },
          { label: '3x2', w: 3, h: 2 },
          { label: '3x3', w: 3, h: 3 },
        ];
    }
  };

  const presets = getPresetsForWidget(widgetType);
  
  return (
    <select
      className="border border-gray-300 rounded px-2 py-1 text-xs bg-white"
      value={`${value.w}x${value.h}`}
      onChange={(e) => {
        const [w, h] = e.target.value.split('x').map(Number);
        onChange({ w, h });
      }}
    >
      {presets.map(p => (
        <option key={p.label} value={`${p.w}x${p.h}`}>
          {p.label}
        </option>
      ))}
    </select>
  );
}
