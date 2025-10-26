import React, { useState } from 'react';
import { X, ArrowRight, Sparkles, Calendar, Briefcase, GraduationCap, Home, Palette } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  preview?: string;
}

interface TemplateSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

const TEMPLATES: Template[] = [
  {
    id: 'default',
    name: '기본 템플릿',
    description: '즐겨찾기, 할일, 날씨 등 기본 위젯들로 구성된 템플릿',
    category: '개인용',
    icon: <Home className="w-6 h-6" />,
    color: 'bg-blue-500',
    preview: '/api/placeholder/300/200'
  },
  {
    id: 'business',
    name: '비즈니스 템플릿',
    description: '업무용 위젯들로 구성된 전문적인 템플릿',
    category: '비즈니스',
    icon: <Briefcase className="w-6 h-6" />,
    color: 'bg-green-500',
    preview: '/api/placeholder/300/200'
  },
  {
    id: 'student',
    name: '학생 템플릿',
    description: '학습과 일정 관리에 최적화된 템플릿',
    category: '학생',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'bg-purple-500',
    preview: '/api/placeholder/300/200'
  },
  {
    id: 'creative',
    name: '크리에이티브 템플릿',
    description: '디자인과 창작 활동에 특화된 템플릿',
    category: '디자인/건축',
    icon: <Palette className="w-6 h-6" />,
    color: 'bg-pink-500',
    preview: '/api/placeholder/300/200'
  }
];

export function TemplateSelectModal({ isOpen, onClose, onSelectTemplate }: TemplateSelectModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              템플릿을 선택하세요
            </h2>
            <p className="text-gray-600">
              나만의 시작페이지를 빠르게 만들어보세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* 템플릿 그리드 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate === template.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* 선택 표시 */}
                {selectedTemplate === template.id && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}

                {/* 템플릿 아이콘 */}
                <div className={`w-12 h-12 ${template.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                  {template.icon}
                </div>

                {/* 템플릿 정보 */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {template.description}
                  </p>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {template.category}
                  </span>
                </div>

                {/* 미리보기 이미지 */}
                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm">미리보기</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {selectedTemplate ? (
              <span>선택된 템플릿: <strong>{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</strong></span>
            ) : (
              <span>템플릿을 선택해주세요</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSelectTemplate}
              disabled={!selectedTemplate}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                selectedTemplate
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              시작하기
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
