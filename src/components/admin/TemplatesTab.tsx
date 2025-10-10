import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  LayoutDashboard, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Save,
  X,
  Copy,
  Users,
  ExternalLink
} from 'lucide-react';
import { templateService, TemplateData } from '../../services/templateService';
import { TemplateEditorPage } from './TemplateEditorPage';

interface TemplatesTabProps {
  onNavigateTemplateEdit?: (initialData?: any) => void;
}

export function TemplatesTab({ onNavigateTemplateEdit }: TemplatesTabProps) {
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [showEditorPage, setShowEditorPage] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateData | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      await templateService.initializeDefaultTemplates();
      const templatesData = await templateService.getAllTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('템플릿 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: TemplateData) => {
    if (onNavigateTemplateEdit) {
      // 템플릿 편집 페이지로 이동
      onNavigateTemplateEdit({
        name: template.name,
        description: template.description,
        category: template.category,
        icon: template.icon,
        color: template.color,
        widgets: template.widgets
      });
    } else {
      // 기존 방식 (모달)
      setEditingTemplate(template);
      setShowEditorPage(true);
    }
  };

  const handleCreateNew = () => {
    if (onNavigateTemplateEdit) {
      // 템플릿 편집 페이지로 이동 (새 템플릿)
      onNavigateTemplateEdit();
    } else {
      // 기존 방식 (모달)
      setEditingTemplate(null);
      setShowEditorPage(true);
    }
  };

  const handleSaveTemplate = async (templateData: {
    name: string;
    description: string;
    category: string;
    icon: string;
    color: string;
    widgets: any[];
  }) => {
    try {
      if (editingTemplate) {
        // 기존 템플릿 수정
        await templateService.updateTemplate(editingTemplate.id, {
          ...templateData,
          widgetCount: templateData.widgets.length,
          preview: templateData.widgets.map(w => w.type)
        });
      } else {
        // 새 템플릿 생성
        await templateService.createTemplate({
          ...templateData,
          isActive: true,
          isDefault: false,
          author: 'admin',
          widgetCount: templateData.widgets.length,
          preview: templateData.widgets.map(w => w.type)
        });
      }
      
      await loadTemplates();
      setShowEditorPage(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('템플릿 저장 실패:', error);
      alert('템플릿 저장에 실패했습니다.');
    }
  };

  const handleBackFromEditor = () => {
    setShowEditorPage(false);
    setEditingTemplate(null);
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    try {
      await templateService.deleteTemplate(templateId);
      await loadTemplates();
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('템플릿 삭제 실패:', error);
    }
  };

  const handleToggleActive = async (template: TemplateData) => {
    try {
      await templateService.updateTemplate(template.id, {
        isActive: !template.isActive
      });
      await loadTemplates();
    } catch (error) {
      console.error('템플릿 상태 변경 실패:', error);
    }
  };

  const duplicateTemplate = async (template: TemplateData) => {
    try {
      // id, createdAt, lastModified는 createTemplate에서 자동 생성됨
      const { id, createdAt, lastModified, ...rest } = template;
      const duplicateData = {
        ...rest,
        name: `${template.name} (복사본)`,
        isDefault: false,
        author: 'admin'
      };
      
      await templateService.createTemplate(duplicateData);
      await loadTemplates();
    } catch (error) {
      console.error('템플릿 복제 실패:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">템플릿 관리</h2>
          <p className="text-gray-600">
            페이지 템플릿을 생성, 수정, 삭제하고 사용 현황을 확인합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadTemplates}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button
            size="sm"
            onClick={handleCreateNew}
          >
            <Plus className="w-4 h-4 mr-2" />
            새 템플릿 만들기
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 템플릿 목록 */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <Card className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">템플릿을 불러오는 중...</p>
            </Card>
          ) : templates.length === 0 ? (
            <Card className="p-8 text-center">
              <LayoutDashboard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">등록된 템플릿이 없습니다.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{template.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          {template.isDefault && (
                            <Badge variant="secondary" className="text-xs">기본</Badge>
                          )}
                          {!template.isActive && (
                            <Badge variant="outline" className="text-xs text-gray-500">비활성</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{template.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{template.category}</span>
                          <span>•</span>
                          <span>위젯 {template.widgetCount}개</span>
                          <span>•</span>
                          <span>수정: {template.lastModified.toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(template);
                        }}
                        className="p-1"
                      >
                        {template.isActive ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateTemplate(template);
                        }}
                        className="p-1"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(template);
                        }}
                        className="p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!template.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(template.id);
                          }}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 템플릿 상세 정보 및 편집 */}
        <div className="lg:col-span-1">
          {selectedTemplate ? (
            <Card className="p-6 sticky top-4">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{selectedTemplate.icon}</span>
                  <h3 className="text-lg font-bold text-gray-900">{selectedTemplate.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{selectedTemplate.description}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge>{selectedTemplate.category}</Badge>
                  {selectedTemplate.isDefault && <Badge variant="secondary">기본</Badge>}
                  {!selectedTemplate.isActive && <Badge variant="outline">비활성</Badge>}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">위젯 구성</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.preview.slice(0, 10).map((widgetType, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {widgetType}
                        </Badge>
                      ))}
                      {selectedTemplate.preview.length > 10 && (
                        <Badge variant="outline" className="text-xs">
                          +{selectedTemplate.preview.length - 10}개 더
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">생성일</div>
                    <div className="text-sm">{selectedTemplate.createdAt.toLocaleDateString('ko-KR')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">마지막 수정</div>
                    <div className="text-sm">{selectedTemplate.lastModified.toLocaleDateString('ko-KR')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">작성자</div>
                    <div className="text-sm">{selectedTemplate.author}</div>
                  </div>
                </div>

              <div className="pt-4 border-t mt-4">
                <Button
                  onClick={() => handleEdit(selectedTemplate)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  전체 화면으로 템플릿 편집
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <LayoutDashboard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">템플릿을 선택하세요</p>
            </Card>
          )}
        </div>
      </div>

      {/* 템플릿 편집 페이지 */}
      {showEditorPage && (
        <div className="fixed inset-0 z-[9999] bg-white">
          <TemplateEditorPage
            onBack={handleBackFromEditor}
            onSave={handleSaveTemplate}
            initialData={editingTemplate ? {
              name: editingTemplate.name,
              description: editingTemplate.description,
              category: editingTemplate.category,
              icon: editingTemplate.icon,
              color: editingTemplate.color,
              widgets: editingTemplate.widgets
            } : undefined}
          />
        </div>
      )}
    </div>
  );
}