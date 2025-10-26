// API 엔드포인트 및 라우팅 유틸리티

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TemplateCloneRequest {
  templateId: string;
  userId?: string;
  customizations?: {
    title?: string;
    description?: string;
    widgets?: any[];
  };
}

export interface TemplateCloneResponse {
  newPageId: string;
  templateId: string;
  clonedAt: string;
}

export interface ShareRequest {
  pageId: string;
  mode: 'private' | 'unlisted' | 'public';
  expiresAt?: string;
}

export interface ShareResponse {
  shareUrl: string;
  token?: string;
  expiresAt?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 템플릿 복제
  async cloneTemplate(request: TemplateCloneRequest): Promise<ApiResponse<TemplateCloneResponse>> {
    return this.request<TemplateCloneResponse>('/templates/clone', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 페이지 공유 설정
  async sharePage(request: ShareRequest): Promise<ApiResponse<ShareResponse>> {
    return this.request<ShareResponse>('/pages/share', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 템플릿 저장
  async saveTemplate(templateData: {
    pageId: string;
    title: string;
    description: string;
    tags: string[];
    removePersonalInfo: boolean;
    removeTokens: boolean;
    removeNotes: boolean;
  }): Promise<ApiResponse<{ templateId: string }>> {
    return this.request<{ templateId: string }>('/templates/save', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  }

  // 템플릿 목록 조회
  async getTemplates(params: {
    category?: string;
    sort?: 'popular' | 'latest';
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.set('category', params.category);
    if (params.sort) queryParams.set('sort', params.sort);
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.offset) queryParams.set('offset', params.offset.toString());

    return this.request<any[]>(`/templates?${queryParams.toString()}`);
  }

  // 템플릿 상세 조회
  async getTemplate(templateId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/templates/${templateId}`);
  }

  // 페이지 조회 (공개/비공개)
  async getPage(pageId: string, token?: string): Promise<ApiResponse<any>> {
    const url = token ? `/pages/${pageId}?token=${token}` : `/pages/${pageId}`;
    return this.request<any>(url);
  }

  // 검색
  async search(query: string, type: 'templates' | 'pages' | 'users' = 'templates'): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/search?q=${encodeURIComponent(query)}&type=${type}`);
  }

  // 통계 업데이트
  async updateStats(type: 'view' | 'clone' | 'favorite', targetId: string): Promise<ApiResponse<void>> {
    return this.request<void>('/stats/update', {
      method: 'POST',
      body: JSON.stringify({ type, targetId }),
    });
  }

  // OG 이미지 생성
  async generateOGImage(templateId: string): Promise<ApiResponse<{ imageUrl: string }>> {
    return this.request<{ imageUrl: string }>(`/og/template/${templateId}`, {
      method: 'POST',
    });
  }
}

// 전역 API 클라이언트
export const apiClient = new ApiClient();

// 라우팅 유틸리티
export class RouterUtils {
  // 템플릿 페이지 URL 생성
  static getTemplateUrl(templateId: string): string {
    return `/t/${templateId}`;
  }

  // 공개 페이지 URL 생성
  static getPageUrl(pageId: string, token?: string): string {
    return token ? `/p/${pageId}?t=${token}` : `/p/${pageId}`;
  }

  // 템플릿 카테고리 URL 생성
  static getCategoryUrl(category: string): string {
    return `/templates?tag=${encodeURIComponent(category)}`;
  }

  // 검색 URL 생성
  static getSearchUrl(query: string): string {
    return `/search?q=${encodeURIComponent(query)}`;
  }

  // 사용자 페이지 URL 생성
  static getUserPageUrl(userId: string): string {
    return `/user/${userId}`;
  }

  // 내 페이지 URL 생성
  static getMyPageUrl(pageId?: string): string {
    return pageId ? `/mypage/${pageId}` : '/mypage';
  }

  // URL에서 템플릿 ID 추출
  static extractTemplateId(url: string): string | null {
    const match = url.match(/\/t\/([^/?]+)/);
    return match ? match[1] : null;
  }

  // URL에서 페이지 ID 추출
  static extractPageId(url: string): string | null {
    const match = url.match(/\/p\/([^/?]+)/);
    return match ? match[1] : null;
  }

  // URL에서 토큰 추출
  static extractToken(url: string): string | null {
    const match = url.match(/[?&]t=([^&]+)/);
    return match ? match[1] : null;
  }
}

// 편의 함수들
export const cloneTemplate = (request: TemplateCloneRequest) => 
  apiClient.cloneTemplate(request);

export const sharePage = (request: ShareRequest) => 
  apiClient.sharePage(request);

export const saveTemplate = (templateData: any) => 
  apiClient.saveTemplate(templateData);

export const getTemplates = (params?: any) => 
  apiClient.getTemplates(params);

export const getTemplate = (templateId: string) => 
  apiClient.getTemplate(templateId);

export const getPage = (pageId: string, token?: string) => 
  apiClient.getPage(pageId, token);

export const search = (query: string, type?: string) => 
  apiClient.search(query, type as any);

export const updateStats = (type: string, targetId: string) => 
  apiClient.updateStats(type as any, targetId);

export const generateOGImage = (templateId: string) => 
  apiClient.generateOGImage(templateId);
