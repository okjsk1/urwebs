import { Edit, Save } from 'lucide-react';
import { Button } from './ui/button';

interface PageTabsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tabId: string) => void;
  isEditMode: boolean;
  onToggleEdit: () => void;
}

export function PageTabs({ tabs, activeTab, onChange, isEditMode, onToggleEdit }: PageTabsProps) {
  return (
    <div className="sticky top-0 z-[1000] bg-white/85 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* 탭 목록 */}
          <div className="flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onChange(tab)}
                className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label={`${tab} 탭`}
                aria-current={activeTab === tab ? 'page' : undefined}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 편집 모드 토글 */}
          <Button
            onClick={onToggleEdit}
            variant={isEditMode ? 'default' : 'outline'}
            size="sm"
            className={`${
              isEditMode
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'hover:bg-gray-100'
            }`}
            aria-label={isEditMode ? '편집 완료' : '편집 모드'}
          >
            {isEditMode ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                편집 완료
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                편집
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}






















