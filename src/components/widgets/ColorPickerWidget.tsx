// 컬러 팔레트 위젯 - HSL 톤 생성, 인라인 입력 폼, 자동 대비 계산
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Plus, Copy, Check } from 'lucide-react';
import { 
  WidgetProps, 
  persistOrLocal, 
  readLocal, 
  copyToClipboard, 
  getContrastColor, 
  generateHSLColors,
  showToast 
} from './utils/widget-helpers';

interface ColorPickerState {
  colors: string[];
  selectedColor: string;
  colorMode: 'random' | 'trend' | 'hsl';
  customColorInput: string;
  showCustomForm: boolean;
}

export const ColorPickerWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<ColorPickerState>(() => {
    const saved = readLocal(widget.id, {
      colors: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
      ],
      selectedColor: '#3B82F6',
      colorMode: 'random' as const,
      customColorInput: '',
      showCustomForm: false
    });
    return saved;
  });

  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // 상태 저장
  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, updateWidget]);

  const generateRandomColors = useCallback(() => {
    const newColors = Array.from({ length: 10 }, () => {
      return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    });
    setState(prev => ({ ...prev, colors: newColors, colorMode: 'random' }));
  }, []);

  const generateTrendColors = useCallback(() => {
    const trendColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    setState(prev => ({ ...prev, colors: trendColors, colorMode: 'trend' }));
  }, []);

  const generateHSLColors = useCallback(() => {
    const hslColors = generateHSLColors(10);
    setState(prev => ({ ...prev, colors: hslColors, colorMode: 'hsl' }));
  }, []);

  const selectColor = useCallback((color: string) => {
    setState(prev => ({ ...prev, selectedColor: color }));
  }, []);

  const copyColor = useCallback(async (color: string) => {
    const success = await copyToClipboard(color);
    if (success) {
      setCopiedColor(color);
      showToast(`색상 ${color} 복사됨`, 'success');
      setTimeout(() => setCopiedColor(null), 2000);
      selectColor(color);
    } else {
      showToast('복사 실패', 'error');
    }
  }, [selectColor]);

  const addCustomColor = useCallback(() => {
    if (!state.customColorInput.trim()) {
      showToast('색상 코드를 입력하세요', 'error');
      return;
    }

    const color = state.customColorInput.trim().toUpperCase();
    const hexRegex = /^#[0-9A-F]{6}$/i;
    
    if (!hexRegex.test(color)) {
      showToast('올바른 HEX 코드 형식이 아닙니다 (#FF5733)', 'error');
      return;
    }

    setState(prev => ({
      ...prev,
      colors: [color, ...prev.colors.slice(0, 9)],
      customColorInput: '',
      showCustomForm: false
    }));
    showToast('커스텀 색상 추가됨', 'success');
  }, [state.customColorInput]);

  const removeColor = useCallback((colorToRemove: string) => {
    setState(prev => ({
      ...prev,
      colors: prev.colors.filter(color => color !== colorToRemove),
      selectedColor: prev.selectedColor === colorToRemove ? prev.colors[0] || '#3B82F6' : prev.selectedColor
    }));
  }, []);

  const selectedColorContrast = useMemo(() => 
    getContrastColor(state.selectedColor), 
    [state.selectedColor]
  );

  return (
    <div className="p-3">
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">🎨</div>
        <h4 className="font-semibold text-sm text-gray-800">컬러 팔레트</h4>
        <p className="text-xs text-gray-500">인스피레이션을 주는 색상들</p>
      </div>

      {/* 색상 생성 모드 */}
      <div className="grid grid-cols-3 gap-1 mb-3">
        <Button
          size="sm"
          variant={state.colorMode === 'random' ? 'default' : 'outline'}
          className="h-6 text-xs"
          onClick={generateRandomColors}
          aria-label="랜덤 색상 생성"
        >
          랜덤
        </Button>
        <Button
          size="sm"
          variant={state.colorMode === 'trend' ? 'default' : 'outline'}
          className="h-6 text-xs"
          onClick={generateTrendColors}
          aria-label="트렌드 색상 생성"
        >
          트렌드
        </Button>
        <Button
          size="sm"
          variant={state.colorMode === 'hsl' ? 'default' : 'outline'}
          className="h-6 text-xs"
          onClick={generateHSLColors}
          aria-label="HSL 색상 생성"
        >
          HSL
        </Button>
      </div>

      {/* 선택된 색상 표시 */}
      <div className="mb-3">
        <div 
          className="w-full h-16 rounded border-2 border-gray-300 mb-2 relative overflow-hidden"
          style={{ backgroundColor: state.selectedColor }}
        >
          <div 
            className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold"
            style={{ color: selectedColorContrast }}
          >
            {state.selectedColor}
          </div>
        </div>
        <div className="flex gap-1">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 h-6 text-xs"
            onClick={() => copyColor(state.selectedColor)}
            aria-label={`${state.selectedColor} 색상 복사`}
          >
            {copiedColor === state.selectedColor ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                복사됨
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                복사하기
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 색상 팔레트 */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {state.colors.map((color, index) => (
          <div key={`${color}-${index}`} className="relative group">
            <button
              className="w-full h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors relative overflow-hidden"
              style={{ backgroundColor: color }}
              onClick={() => selectColor(color)}
              onDoubleClick={() => copyColor(color)}
              title={`${color} - 더블클릭으로 복사`}
              aria-label={`${color} 색상 선택`}
            >
              {state.selectedColor === color && (
                <div 
                  className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                  style={{ color: getContrastColor(color) }}
                >
                  ✓
                </div>
              )}
            </button>
            {isEditMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeColor(color);
                }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`${color} 색상 삭제`}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 커스텀 색상 추가 폼 */}
      {isEditMode && (
        <div className="space-y-2">
          {!state.showCustomForm ? (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full h-6 text-xs"
              onClick={() => setState(prev => ({ ...prev, showCustomForm: true }))}
            >
              <Plus className="w-3 h-3 mr-1" />
              색상 추가
            </Button>
          ) : (
            <div className="space-y-2 p-2 bg-gray-50 rounded">
              <input
                type="text"
                value={state.customColorInput}
                onChange={(e) => setState(prev => ({ ...prev, customColorInput: e.target.value }))}
                placeholder="#FF5733"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                aria-label="커스텀 색상 코드 입력"
              />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  className="flex-1 h-6 text-xs"
                  onClick={addCustomColor}
                >
                  추가
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => setState(prev => ({ 
                    ...prev, 
                    showCustomForm: false, 
                    customColorInput: '' 
                  }))}
                >
                  취소
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
