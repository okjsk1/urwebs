import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { X, Save, Share } from 'lucide-react';
import { Widget } from '../../types/mypage.types';

interface SaveAsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: Widget[];
  onSave: (templateData: {
    name: string;
    description: string;
    category: string;
    isPublic: boolean;
  }) => void;
}

export function SaveAsTemplateModal({ isOpen, onClose, widgets, onSave }: SaveAsTemplateModalProps) {
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    category: '사용자',
    isPublic: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateData.name.trim()) {
      alert('템플릿 이름을 입력해주세요.');
      return;
    }
    onSave(templateData);
    setTemplateData({ name: '', description: '', category: '사용자', isPublic: false });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">배치를 템플릿으로 저장</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              템플릿 이름 *
            </label>
            <input
              type="text"
              value={templateData.name}
              onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="예: 나만의 작업공간"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={templateData.description}
              onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={3}
              placeholder="이 템플릿에 대한 설명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              카테고리
            </label>
            <select
              value={templateData.category}
              onChange={(e) => setTemplateData({ ...templateData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="사용자">사용자 템플릿</option>
              <option value="생산성">생산성</option>
              <option value="개발">개발</option>
              <option value="디자인">디자인</option>
              <option value="교육">교육</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={templateData.isPublic}
              onChange={(e) => setTemplateData({ ...templateData, isPublic: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              다른 사용자들과 공유하기
            </label>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">포함된 위젯 ({widgets.length}개)</div>
            <div className="flex flex-wrap gap-1">
              {widgets.map((widget) => (
                <span
                  key={widget.id}
                  className="px-2 py-1 bg-white rounded text-xs border"
                >
                  {widget.title}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={!templateData.name.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              템플릿 저장
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}




























<<<<<<< HEAD
=======


>>>>>>> f18eacae9db3a659b475638dca7b7d0b0ae30bd6
