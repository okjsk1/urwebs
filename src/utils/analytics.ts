// 분석 이벤트 트래킹 유틸리티
export interface AnalyticsEvent {
  event: string;
  data?: Record<string, any>;
  timestamp?: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];

  // 이벤트 트래킹
  track(event: string, data?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      data,
      timestamp: Date.now()
    };

    this.events.push(analyticsEvent);
    
    // 콘솔에 로그 출력 (개발용)
    console.log('📊 Analytics Event:', analyticsEvent);
    
    // TODO: 실제 분석 도구 연동 (Google Analytics, Mixpanel 등)
    // gtag('event', event, data);
    // mixpanel.track(event, data);
  }

  // 이벤트 히스토리 조회
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  // 특정 이벤트 필터링
  getEventsByType(eventType: string): AnalyticsEvent[] {
    return this.events.filter(e => e.event === eventType);
  }

  // 이벤트 초기화
  clear() {
    this.events = [];
  }
}

// 전역 분석 인스턴스
export const analytics = new Analytics();

// 편의 함수들
export const trackEvent = (event: string, data?: Record<string, any>) => {
  analytics.track(event, data);
};

// 주요 이벤트 타입들
export const ANALYTICS_EVENTS = {
  CTA_CLICK: 'cta_click',
  VIEW_TEMPLATE: 'view_template',
  CLONE_TEMPLATE: 'clone_template',
  FIRST_WIDGET_ADDED: 'first_widget_added',
  SHARE_CLICK: 'share_click',
  SEARCH_QUERY: 'search_query',
  CATEGORY_CLICK: 'category_click',
  TEMPLATE_PREVIEW: 'template_preview',
  SOCIAL_PROOF_CLICK: 'social_proof_click',
  TEMPLATE_SAVED: 'template_saved',
  SEARCH_SUBMIT: 'search_submit',
  TAG_CLICK: 'tag_click',
  PAGE_VIEW: 'page_view',
  WIDGET_ADDED: 'widget_added',
  WIDGET_REMOVED: 'widget_removed',
  LAYOUT_CHANGED: 'layout_changed'
} as const;
