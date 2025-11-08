// 분석 이벤트 트래킹 유틸리티
export interface AnalyticsEvent {
  event: string;
  data?: Record<string, any>;
  timestamp?: number;
}

export type AnalyticsListener = (event: AnalyticsEvent) => void;
export type AnalyticsTransport = {
  send(event: AnalyticsEvent): void | Promise<void>;
};

const STORAGE_EVENT_LOG_KEY = 'analytics-event-log-v1';
const STORAGE_WIDGET_USAGE_KEY = 'analytics-widget-usage-v1';
const STORAGE_RECENT_TEMPLATES_KEY = 'analytics-recent-templates-v1';

const MAX_EVENT_LOG = 500;
const MAX_WIDGET_LOG = 300;
const RECENT_TEMPLATE_LIMIT = 8;
const POPULAR_WIDGET_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7일

class Analytics {
  private events: AnalyticsEvent[] = [];
  private listeners = new Set<AnalyticsListener>();
  private transports = new Set<AnalyticsTransport>();

  track(event: string, data?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      data,
      timestamp: Date.now(),
    };

    this.events.push(analyticsEvent);

    if (this.events.length > MAX_EVENT_LOG) {
      this.events.splice(0, this.events.length - MAX_EVENT_LOG);
    }

    console.log('📊 Analytics Event:', analyticsEvent);

    this.persist(analyticsEvent);
    this.listeners.forEach((listener) => listener(analyticsEvent));
    this.transports.forEach((transport) => {
      try {
        transport.send(analyticsEvent);
      } catch (error) {
        console.warn('[analytics] transport error', error);
      }
    });
  }

  registerTransport(transport: AnalyticsTransport) {
    this.transports.add(transport);
    return () => this.transports.delete(transport);
  }

  addListener(listener: AnalyticsListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getEventsByType(eventType: string): AnalyticsEvent[] {
    return this.events.filter((e) => e.event === eventType);
  }

  clear() {
    this.events = [];
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_EVENT_LOG_KEY);
        localStorage.removeItem(STORAGE_WIDGET_USAGE_KEY);
      } catch (error) {
        console.warn('[analytics] clear local storage failed', error);
      }
    }
  }

  private persist(event: AnalyticsEvent) {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem(STORAGE_EVENT_LOG_KEY);
      const log: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
      log.push(event);
      if (log.length > MAX_EVENT_LOG) {
        log.splice(0, log.length - MAX_EVENT_LOG);
      }
      localStorage.setItem(STORAGE_EVENT_LOG_KEY, JSON.stringify(log));
    } catch (error) {
      console.warn('[analytics] event log persist failed', error);
    }

    if (event.event === ANALYTICS_EVENTS.WIDGET_ADDED && event.data?.widgetType) {
      this.persistWidgetUsage(event.data.widgetType as string, event.timestamp!);
    }

    if (
      event.event === ANALYTICS_EVENTS.TEMPLATE_SELECTED ||
      event.event === ANALYTICS_EVENTS.CLONE_TEMPLATE ||
      event.event === ANALYTICS_EVENTS.TEMPLATE_SAVED
    ) {
      if (event.data?.templateId || event.data?.pageId) {
        this.persistRecentTemplate(event);
      }
    }
  }

  private persistWidgetUsage(widgetType: string, timestamp: number) {
    try {
      const raw = localStorage.getItem(STORAGE_WIDGET_USAGE_KEY);
      const log: Array<{ widgetType: string; timestamp: number }> = raw ? JSON.parse(raw) : [];
      log.push({ widgetType, timestamp });

      const minTimestamp = Date.now() - POPULAR_WIDGET_WINDOW_MS;
      const filtered = log.filter((item) => item.timestamp >= minTimestamp);
      if (filtered.length > MAX_WIDGET_LOG) {
        filtered.splice(0, filtered.length - MAX_WIDGET_LOG);
      }
      localStorage.setItem(STORAGE_WIDGET_USAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.warn('[analytics] widget usage persist failed', error);
    }
  }

  private persistRecentTemplate(event: AnalyticsEvent) {
    try {
      const raw = localStorage.getItem(STORAGE_RECENT_TEMPLATES_KEY);
      const list: Array<{ id: string; name?: string; timestamp: number; source: string }> = raw ? JSON.parse(raw) : [];

      const id = (event.data?.templateId || event.data?.pageId) as string;
      if (!id) return;

      const name = (event.data?.templateName || event.data?.pageTitle) as string | undefined;
      const source = event.event;

      const filtered = list.filter((item) => item.id !== id);
      filtered.unshift({ id, name, timestamp: event.timestamp!, source });

      if (filtered.length > RECENT_TEMPLATE_LIMIT) {
        filtered.splice(RECENT_TEMPLATE_LIMIT);
      }

      localStorage.setItem(STORAGE_RECENT_TEMPLATES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.warn('[analytics] recent template persist failed', error);
    }
  }
}

export const analytics = new Analytics();

export const trackEvent = (event: string, data?: Record<string, any>) => {
  analytics.track(event, data);
};

export const registerAnalyticsTransport = (transport: AnalyticsTransport) =>
  analytics.registerTransport(transport);

export const subscribeAnalytics = (listener: AnalyticsListener) => analytics.addListener(listener);

export const getPopularWidgets = (options?: { windowMs?: number; limit?: number }) => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_WIDGET_USAGE_KEY);
    const log: Array<{ widgetType: string; timestamp: number }> = raw ? JSON.parse(raw) : [];
    const windowMs = options?.windowMs ?? POPULAR_WIDGET_WINDOW_MS;
    const minTimestamp = Date.now() - windowMs;

    const counts = log.reduce<Map<string, number>>((map, item) => {
      if (item.timestamp < minTimestamp) return map;
      map.set(item.widgetType, (map.get(item.widgetType) || 0) + 1);
      return map;
    }, new Map());

    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, options?.limit ?? 5)
      .map(([widgetType, count]) => ({ widgetType, count }));

    return sorted;
  } catch (error) {
    console.warn('[analytics] popular widget load failed', error);
    return [];
  }
};

export const getRecentTemplates = (limit: number = RECENT_TEMPLATE_LIMIT) => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_RECENT_TEMPLATES_KEY);
    const list: Array<{ id: string; name?: string; timestamp: number; source: string }> = raw ? JSON.parse(raw) : [];
    return list.slice(0, limit);
  } catch (error) {
    console.warn('[analytics] recent template load failed', error);
    return [];
  }
};

export const ANALYTICS_EVENTS = {
  CTA_CLICK: 'cta_click',
  VIEW_TEMPLATE: 'view_template',
  CLONE_TEMPLATE: 'clone_template',
  FIRST_WIDGET_ADDED: 'first_widget_added',
  WIDGET_ADDED: 'widget_added',
  SHARE_CLICK: 'share_click',
  SEARCH_QUERY: 'search_query',
  CATEGORY_CLICK: 'category_click',
  TEMPLATE_PREVIEW: 'template_preview',
  SOCIAL_PROOF_CLICK: 'social_proof_click',
  TEMPLATE_SAVED: 'template_saved',
  TEMPLATE_SELECTED: 'template_selected',
  SEARCH_SUBMIT: 'search_submit',
  TAG_CLICK: 'tag_click',
  PAGE_VIEW: 'page_view',
  PAGE_ENTER: 'page_enter',
  WIDGET_REMOVED: 'widget_removed',
  LAYOUT_CHANGED: 'layout_changed',
  FIRST_VISIT: 'first_visit',
  RETURNING_VISIT: 'returning_visit',
  TUTORIAL_STARTED: 'tutorial_started',
  TUTORIAL_STEP_COMPLETED: 'tutorial_step_completed',
  TUTORIAL_COMPLETED: 'tutorial_completed',
} as const;
