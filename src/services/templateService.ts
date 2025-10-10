import { db } from '../firebase/config';
import { collection, doc, getDocs, updateDoc, addDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { templates as defaultTemplates } from '../constants/pageTemplates';

export interface TemplateData {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  lastModified: Date;
  author: string;
  widgetCount: number;
  preview: string[];
  // 실제 위젯 데이터
  widgets: Array<{
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    title: string;
    content?: any;
    zIndex: number;
    size: string;
  }>;
}

export class TemplateService {
  private static instance: TemplateService;
  private templatesCache: Map<string, TemplateData> = new Map();
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5분

  static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  // 기본 템플릿을 Firestore에 초기화
  async initializeDefaultTemplates(): Promise<void> {
    try {
      const templatesRef = collection(db, 'templates');
      const snapshot = await getDocs(templatesRef);
      
      // 이미 템플릿이 있으면 초기화하지 않음
      if (snapshot.size > 0) {
        return;
      }

      // 기본 템플릿들을 Firestore에 저장
      const defaultTemplatesArray = Object.entries(defaultTemplates).map(([key, template]) => ({
        id: key,
        name: template.name,
        description: template.description,
        category: template.category || '일반',
        icon: template.icon || '📄',
        color: template.color || '#3B82F6',
        isActive: true,
        isDefault: true,
        createdAt: new Date(),
        lastModified: new Date(),
        author: 'system',
        widgetCount: template.widgets.length,
        preview: template.widgets.map(w => w.type),
        widgets: template.widgets.map((widget, index) => ({
          id: widget.id || `${key}_${index}`,
          type: widget.type,
          x: widget.x,
          y: widget.y,
          width: widget.width,
          height: widget.height,
          title: widget.title,
          content: widget.content,
          zIndex: 1,
          size: `${Math.ceil(widget.width / 100)}x${Math.ceil(widget.height / 100)}`
        }))
      }));

      // Firestore에 배치로 저장
      for (const template of defaultTemplatesArray) {
        await addDoc(templatesRef, template);
      }

      console.log('기본 템플릿 초기화 완료');
    } catch (error) {
      console.error('기본 템플릿 초기화 실패:', error);
      // Firestore 권한 문제로 실패해도 계속 진행
    }
  }

  // 모든 템플릿 가져오기 (캐시 사용)
  async getAllTemplates(): Promise<TemplateData[]> {
    const now = Date.now();
    
    // 캐시가 유효하면 캐시된 데이터 반환
    if (now - this.lastFetch < this.CACHE_DURATION && this.templatesCache.size > 0) {
      return Array.from(this.templatesCache.values());
    }

    try {
      const templatesRef = collection(db, 'templates');
      const q = query(templatesRef, orderBy('lastModified', 'desc'));
      const snapshot = await getDocs(q);
      
      const templates: TemplateData[] = [];
      this.templatesCache.clear();

      snapshot.forEach((doc) => {
        const templateData = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          lastModified: doc.data().lastModified?.toDate() || new Date()
        } as TemplateData;
        
        templates.push(templateData);
        this.templatesCache.set(doc.id, templateData);
      });

      this.lastFetch = now;
      return templates;
    } catch (error) {
      console.error('템플릿 가져오기 실패:', error);
      // Firestore 권한 문제 시 로컬 템플릿 사용
      return this.getLocalTemplates();
    }
  }

  // 로컬 템플릿 반환 (Firestore 접근 실패 시 사용)
  private getLocalTemplates(): TemplateData[] {
    const localTemplates: TemplateData[] = Object.entries(defaultTemplates).map(([key, template]) => ({
      id: key,
      name: template.name,
      description: template.description,
      category: template.category || '일반',
      icon: template.icon || '📄',
      color: template.color || '#3B82F6',
      isActive: true,
      isDefault: true,
      createdAt: new Date(),
      lastModified: new Date(),
      author: 'system',
      widgetCount: template.widgets.length,
      preview: template.widgets.map(w => w.type),
      widgets: template.widgets.map((widget, index) => ({
        id: widget.id || `${key}_${index}`,
        type: widget.type,
        x: widget.x,
        y: widget.y,
        width: widget.width,
        height: widget.height,
        title: widget.title,
        content: widget.content,
        zIndex: 1,
        size: `${Math.ceil(widget.width / 100)}x${Math.ceil(widget.height / 100)}`
      }))
    }));

    // 로컬 템플릿도 캐시에 저장
    this.templatesCache.clear();
    localTemplates.forEach(template => {
      this.templatesCache.set(template.id, template);
    });
    this.lastFetch = Date.now();

    return localTemplates;
  }

  // 특정 템플릿 가져오기
  async getTemplate(templateId: string): Promise<TemplateData | null> {
    try {
      // 캐시에서 먼저 확인
      if (this.templatesCache.has(templateId)) {
        return this.templatesCache.get(templateId)!;
      }

      const templatesRef = collection(db, 'templates');
      const q = query(templatesRef, where('id', '==', templateId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const templateData = {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastModified: doc.data().lastModified?.toDate() || new Date()
      } as TemplateData;

      // 캐시에 저장
      this.templatesCache.set(templateId, templateData);
      return templateData;
    } catch (error) {
      console.error('템플릿 가져오기 실패:', error);
      // Firestore 접근 실패 시 로컬 템플릿에서 찾기
      const localTemplates = this.getLocalTemplates();
      return localTemplates.find(t => t.id === templateId) || null;
    }
  }

  // 템플릿 업데이트
  async updateTemplate(templateId: string, updates: Partial<TemplateData>): Promise<void> {
    try {
      const templatesRef = collection(db, 'templates');
      const q = query(templatesRef, where('id', '==', templateId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('템플릿을 찾을 수 없습니다');
      }

      const docRef = doc(db, 'templates', snapshot.docs[0].id);
      await updateDoc(docRef, {
        ...updates,
        lastModified: new Date()
      });

      // 캐시 무효화
      this.templatesCache.delete(templateId);
      this.lastFetch = 0;

      console.log('템플릿 업데이트 완료:', templateId);
    } catch (error) {
      console.error('템플릿 업데이트 실패:', error);
      throw error;
    }
  }

  // 새 템플릿 생성
  async createTemplate(templateData: Omit<TemplateData, 'id' | 'createdAt' | 'lastModified'>): Promise<string> {
    try {
      const templatesRef = collection(db, 'templates');
      const templateId = `template_${Date.now()}`;
      
      const docRef = await addDoc(templatesRef, {
        ...templateData,
        id: templateId,
        createdAt: new Date(),
        lastModified: new Date()
      });

      // 캐시 무효화
      this.lastFetch = 0;

      console.log('템플릿 생성 완료:', docRef.id);
      return templateId;
    } catch (error) {
      console.error('템플릿 생성 실패:', error);
      throw error;
    }
  }

  // 템플릿 삭제
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const templatesRef = collection(db, 'templates');
      const q = query(templatesRef, where('id', '==', templateId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('템플릿을 찾을 수 없습니다');
      }

      await deleteDoc(doc(db, 'templates', snapshot.docs[0].id));

      // 캐시 무효화
      this.templatesCache.delete(templateId);
      this.lastFetch = 0;

      console.log('템플릿 삭제 완료:', templateId);
    } catch (error) {
      console.error('템플릿 삭제 실패:', error);
      throw error;
    }
  }

  // 사용자가 특정 템플릿을 사용했는지 확인
  async hasUserUsedTemplate(userId: string, templateId: string): Promise<boolean> {
    try {
      const userTemplatesRef = collection(db, 'userTemplates');
      const q = query(
        userTemplatesRef, 
        where('userId', '==', userId),
        where('templateId', '==', templateId)
      );
      const snapshot = await getDocs(q);
      
      return !snapshot.empty;
    } catch (error) {
      console.error('사용자 템플릿 사용 여부 확인 실패:', error);
      return false;
    }
  }

  // 사용자가 템플릿을 사용했다고 기록
  async markTemplateAsUsed(userId: string, templateId: string): Promise<void> {
    try {
      const userTemplatesRef = collection(db, 'userTemplates');
      await addDoc(userTemplatesRef, {
        userId,
        templateId,
        usedAt: new Date()
      });

      console.log('템플릿 사용 기록 완료:', { userId, templateId });
    } catch (error) {
      console.error('템플릿 사용 기록 실패:', error);
    }
  }

  // 캐시 무효화
  clearCache(): void {
    this.templatesCache.clear();
    this.lastFetch = 0;
  }
}

export const templateService = TemplateService.getInstance();
