import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, Grid } from 'lucide-react';
import { allWidgets } from '../../constants/widgetCategories';
import {
  ANALYTICS_EVENTS,
  getPopularWidgets,
  subscribeAnalytics,
} from '../../utils/analytics';

const widgetMetaMap = new Map(allWidgets.map((widget) => [widget.type, widget]));

interface PopularWidget {
  widgetType: string;
  count: number;
}

export function PopularWidgetsStrip() {
  const [widgets, setWidgets] = useState<PopularWidget[]>(() => getPopularWidgets({ limit: 6 }));

  useEffect(() => {
    const update = () => setWidgets(getPopularWidgets({ limit: 6 }));
    const unsubscribe = subscribeAnalytics((event) => {
      if (event.event === ANALYTICS_EVENTS.WIDGET_ADDED) {
        update();
      }
    });

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'analytics-widget-usage-v1') {
        update();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const enriched = useMemo(() => {
    return widgets
      .map((item) => {
        const meta = widgetMetaMap.get(item.widgetType);
        return {
          ...item,
          name: meta?.name || item.widgetType,
          icon: meta?.icon,
        };
      })
      .filter((item) => item.count > 0);
  }, [widgets]);

  if (!enriched.length) {
    return null;
  }

  return (
    <section className="mb-6 rounded-2xl border border-indigo-100/60 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-500/10 px-4 py-3 shadow-sm">
      <header className="flex items-center gap-2 mb-3">
        <div className="rounded-full bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-300">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-200">지난 7일 인기 위젯</p>
          <p className="text-xs text-indigo-500/90 dark:text-indigo-300/70">
            최근 사용자들이 자주 추가한 위젯을 확인해보세요.
          </p>
        </div>
      </header>
      <div className="flex flex-wrap gap-3">
        {enriched.map((item) => {
          const Icon = item.icon || Grid;
          return (
            <div
              key={item.widgetType}
              className="group flex min-w-[110px] flex-1 items-center gap-3 rounded-xl border border-transparent bg-white/80 px-3 py-2 text-sm shadow-inner transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:bg-gray-900/60"
            >
              <span className="rounded-lg bg-indigo-100 text-indigo-600 p-2 dark:bg-indigo-500/20 dark:text-indigo-200">
                <Icon className="w-4 h-4" />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {item.name}
                </span>
                <span className="text-xs text-indigo-500 dark:text-indigo-300">{item.count}회 사용</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


