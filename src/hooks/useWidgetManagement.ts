import { useState, useCallback, useMemo } from 'react';
import { Widget, WidgetSize } from '../types/mypage.types';
import { allWidgets } from '../constants/widgetCategories';
import { WIDGET_DEFAULT_SIZES, WIDGET_DEFAULT_CONTENT, WIDGET_DEFAULT_OPTIONS } from '../utils/widgetDefaults';
import { getWidgetDimensions } from '../utils/widgetHelpers';

interface UseWidgetManagementProps {
  widgets: Widget[];
  setWidgets: React.Dispatch<React.SetStateAction<Widget[]>>;
  subCellWidth: number;
  cellHeight: number;
  spacing: number;
  mainColumnWidth: number;
  COL_TRACK: number;
}

export function useWidgetManagement({
  widgets,
  setWidgets,
  subCellWidth,
  cellHeight,
  spacing,
  mainColumnWidth,
  COL_TRACK,
}: UseWidgetManagementProps) {
  
  // 위젯 추가
  const addWidget = useCallback((type: string, size?: WidgetSize, targetColumn?: number) => {
    console.log('addWidget 호출됨:', type, 'size:', size, 'targetColumn:', targetColumn);
    
    // 위젯 기본 크기 가져오기
    const widgetSize = size || WIDGET_DEFAULT_SIZES[type] || '1x1';
    
    // 크기 계산
    let width: number, height: number;
    
    if (type === 'google_search' || type === 'naver_search') {
      // 검색 위젯은 특별 처리
      width = 312; // 2 * 150 + 1 * 12 = 312px
      height = 160; // 1 * 160
    } else {
      const dimensions = getWidgetDimensions(widgetSize, subCellWidth, cellHeight, spacing);
      width = dimensions.width;
      height = dimensions.height;
    }
    
    // 위치 계산
    setWidgets(prevWidgets => {
      let position;
      
      if (targetColumn !== undefined) {
        // 특정 컬럼에 추가
        const columnWidgets = prevWidgets.filter(widget => {
          const col = Math.floor(widget.x / (mainColumnWidth + spacing));
          return col === targetColumn;
        });
        
        const maxY = columnWidgets.length > 0 
          ? Math.max(...columnWidgets.map(w => w.y + w.height))
          : 0;
        
        position = {
          x: targetColumn * (mainColumnWidth + spacing),
          y: maxY + (columnWidgets.length > 0 ? spacing : 0)
        };
      } else {
        // 첫 번째 컬럼에 추가
        const firstColumnWidgets = prevWidgets.filter(widget => {
          const col = Math.floor(widget.x / COL_TRACK);
          return col === 0;
        });
        const maxY = firstColumnWidgets.length > 0 
          ? Math.max(...firstColumnWidgets.map(w => w.y + w.height)) 
          : 0;
        position = {
          x: 0,
          y: maxY + (firstColumnWidgets.length > 0 ? spacing : 0)
        };
      }
      
      // 새 위젯 생성
      const newWidget: Widget = {
        id: Date.now().toString(),
        type: type as any,
        x: position.x,
        y: position.y,
        width,
        height,
        title: allWidgets.find(w => w.type === type)?.name || '새 위젯',
        content: WIDGET_DEFAULT_CONTENT[type],
        zIndex: 1,
        size: widgetSize,
        ...WIDGET_DEFAULT_OPTIONS[type],
      };
      
      console.log('🎨 새 위젯 추가:', {
        type,
        size: widgetSize,
        dimensions: { width, height },
        position: { x: position.x, y: position.y }
      });
      
      return [...prevWidgets, newWidget];
    });
  }, [widgets, subCellWidth, cellHeight, spacing, mainColumnWidth, COL_TRACK]);

  // 위젯 삭제
  const removeWidget = useCallback((id: string) => {
    setWidgets(prevWidgets => prevWidgets.filter(w => w.id !== id));
  }, [setWidgets]);

  // 위젯 업데이트
  const updateWidget = useCallback((id: string, updates: Partial<Widget>) => {
    setWidgets(prevWidgets => 
      prevWidgets.map(w => w.id === id ? { ...w, ...updates } : w)
    );
  }, [setWidgets]);

  // 위젯 복제
  const duplicateWidget = useCallback((id: string) => {
    setWidgets(prevWidgets => {
      const originalWidget = prevWidgets.find(w => w.id === id);
      if (!originalWidget) return prevWidgets;
      
      const newWidget: Widget = {
        ...originalWidget,
        id: Date.now().toString(),
        x: originalWidget.x + 20,
        y: originalWidget.y + 20,
        title: `${originalWidget.title} (복사본)`,
      };
      
      return [...prevWidgets, newWidget];
    });
  }, [setWidgets]);

  // 최근 사용한 위젯 타입 저장
  const recordRecentWidget = useCallback((type: string) => {
    const recentWidgets = JSON.parse(localStorage.getItem('recentWidgets') || '[]');
    const updated = [type, ...recentWidgets.filter((t: string) => t !== type)].slice(0, 5);
    localStorage.setItem('recentWidgets', JSON.stringify(updated));
  }, []);

  // 최근 사용한 위젯 가져오기
  const recentWidgets = useMemo(() => {
    const stored = localStorage.getItem('recentWidgets');
    if (!stored) return [];
    const types = JSON.parse(stored);
    return allWidgets.filter(w => types.includes(w.type));
  }, []);

  return {
    addWidget,
    removeWidget,
    updateWidget,
    duplicateWidget,
    recordRecentWidget,
    recentWidgets,
  };
}


