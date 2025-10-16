import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { widgetCategories, getCategoryIcon } from '../../constants/widgetCategories';
import { WidgetType } from '../../types/mypage.types';

interface WidgetPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (type: WidgetType, size?: any) => void;
}

export function WidgetPanel({ isOpen, onClose, onAddWidget }: WidgetPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999]">
      {/* 바깥 클릭 닫기 오버레이 */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t-4 border-blue-500 shadow-2xl max-h-[60vh] overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">위젯 추가</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {Object.entries(widgetCategories).map(([categoryKey, category]) => (
            <div key={categoryKey}>
              <h4 className="font-semibold text-gray-800 mb-2">
                {category.name}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {category.widgets.map((widget) => {
                  const Icon = widget.icon;
                  return (
                    <button
                      key={widget.type}
                      onClick={() => {
                        const addWithColumn = (window as any).__addWidgetWithColumn;
                        if (addWithColumn) {
                          addWithColumn(widget.type, '1x1');
                        } else {
                          onAddWidget(widget.type);
                        }
                        onClose();
                      }}
                      className="p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all text-left group"
                    >
                      <div className="text-sm font-medium text-gray-800 truncate mb-1">{widget.name}</div>
                      <div className="text-xs text-gray-500 truncate">{widget.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}




