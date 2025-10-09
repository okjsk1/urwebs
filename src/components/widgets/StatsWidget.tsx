// 통계 위젯 - 시드 기반 데이터 생성, 반응형 차트, 접근성 개선
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { 
  WidgetProps, 
  persistOrLocal, 
  readLocal, 
  generateStatsData, 
  generateChartData,
  SeededRandom 
} from './utils/widget-helpers';

interface StatItem {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  unit: string;
  icon: string;
}

interface StatsState {
  timeRange: '24hours' | '7days' | '30days';
  selectedMetric: string;
  showChart: boolean;
}

const METRICS: StatItem[] = [
  { name: '방문자', value: 0, change: 0, trend: 'up', unit: '', icon: '👥' },
  { name: '페이지뷰', value: 0, change: 0, trend: 'up', unit: '', icon: '📄' },
  { name: '체류시간', value: 0, change: 0, trend: 'up', unit: '초', icon: '⏱️' },
  { name: '이탈률', value: 0, change: 0, trend: 'down', unit: '%', icon: '📊' }
];

export const StatsWidget: React.FC<WidgetProps> = ({ widget, isEditMode, updateWidget }) => {
  const [state, setState] = useState<StatsState>(() => {
    const saved = readLocal(widget.id, {
      timeRange: '7days' as const,
      selectedMetric: '',
      showChart: true
    });
    return saved;
  });

  const [stats, setStats] = useState<StatItem[]>(METRICS);

  // 상태 저장
  useEffect(() => {
    persistOrLocal(widget.id, state, updateWidget);
  }, [widget.id, updateWidget]);

  // 통계 데이터 생성
  const generateStats = useCallback((timeRange: string) => {
    const seed = parseInt(widget.id.replace(/\D/g, '')) || 12345;
    const data = generateStatsData(timeRange, seed);
    
    // 이전 데이터와 비교하여 변화율 계산
    const newStats: StatItem[] = METRICS.map((metric, index) => {
      const values = [data.visitors, data.pageviews, data.duration, data.bounceRate];
      const newValue = values[index];
      const oldValue = stats[index]?.value || newValue;
      const change = oldValue > 0 ? ((newValue - oldValue) / oldValue) * 100 : 0;
      
      return {
        ...metric,
        value: newValue,
        change: Math.round(change * 10) / 10,
        trend: change >= 0 ? 'up' : 'down'
      };
    });
    
    setStats(newStats);
  }, [stats, widget.id]);

  // 시간 범위 변경 시 데이터 업데이트
  useEffect(() => {
    generateStats(state.timeRange);
  }, [state.timeRange, generateStats]);

  const changeTimeRange = useCallback((timeRange: '24hours' | '7days' | '30days') => {
    setState(prev => ({ ...prev, timeRange }));
  }, []);

  const selectMetric = useCallback((metricName: string) => {
    setState(prev => ({ 
      ...prev, 
      selectedMetric: prev.selectedMetric === metricName ? '' : metricName 
    }));
  }, []);

  const toggleChart = useCallback(() => {
    setState(prev => ({ ...prev, showChart: !prev.showChart }));
  }, []);

  // 차트 데이터 생성
  const chartData = useMemo(() => {
    const seed = parseInt(widget.id.replace(/\D/g, '')) || 12345;
    const points = state.timeRange === '24hours' ? 24 : state.timeRange === '7days' ? 7 : 30;
    return generateChartData(points, seed);
  }, [state.timeRange, widget.id]);

  const getTrendIcon = useCallback((trend: 'up' | 'down') => {
    return trend === 'up' ? TrendingUp : TrendingDown;
  }, []);

  const getTrendColor = useCallback((trend: 'up' | 'down') => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  }, []);

  const formatValue = useCallback((value: number, unit: string) => {
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    if (unit === '초') {
      return `${Math.floor(value / 60)}분 ${value % 60}초`;
    }
    return value.toLocaleString();
  }, []);

  return (
    <div className="p-3">
      <div className="text-center mb-3">
        <div className="text-2xl mb-1">📊</div>
        <h4 className="font-semibold text-sm text-gray-800">데이터 인사이트</h4>
        <p className="text-xs text-gray-500">스마트한 분석 대시보드</p>
      </div>

      {/* 시간 범위 선택 */}
      <div className="grid grid-cols-3 gap-1 mb-3">
        {[
          { key: '24hours' as const, label: '24시간' },
          { key: '7days' as const, label: '7일' },
          { key: '30days' as const, label: '30일' }
        ].map(range => (
          <Button
            key={range.key}
            size="sm"
            variant={state.timeRange === range.key ? 'default' : 'outline'}
            className="h-6 text-xs"
            onClick={() => changeTimeRange(range.key)}
            aria-label={`${range.label} 데이터 보기`}
          >
            {range.label}
          </Button>
        ))}
      </div>

      {/* 통계 카드들 */}
      <div className="space-y-2 mb-3">
        {stats.map((stat, index) => {
          const TrendIcon = getTrendIcon(stat.trend);
          const isSelected = state.selectedMetric === stat.name;
          
          return (
            <div 
              key={index} 
              className={`p-2 rounded transition-colors cursor-pointer ${
                isSelected ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}
              onClick={() => selectMetric(stat.name)}
              role="button"
              tabIndex={0}
              aria-label={`${stat.name} 통계 - ${formatValue(stat.value, stat.unit)}, ${stat.change > 0 ? '증가' : '감소'} ${Math.abs(stat.change)}%`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selectMetric(stat.name);
                }
              }}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{stat.icon}</span>
                  <span className="text-xs text-gray-600">{stat.name}</span>
                </div>
                <TrendIcon className={`w-3 h-3 ${getTrendColor(stat.trend)}`} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">
                  {formatValue(stat.value, stat.unit)}
                </span>
                <span className={`text-xs ${getTrendColor(stat.trend)}`}>
                  {stat.change > 0 ? '+' : ''}{stat.change}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 차트 토글 및 차트 영역 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">트렌드 차트</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-5 w-5 p-0"
            onClick={toggleChart}
            aria-label={state.showChart ? '차트 숨기기' : '차트 보기'}
          >
            <BarChart3 className="w-3 h-3" />
          </Button>
        </div>
        
        {state.showChart && (
          <div className="bg-gray-100 rounded p-2">
            <div className="h-16 flex items-end justify-between gap-1">
              {chartData.map((height, index) => {
                const maxHeight = Math.max(...chartData);
                const percentage = (height / maxHeight) * 100;
                
                return (
                  <div
                    key={index}
                    className="bg-blue-500 rounded-t flex-1 transition-all duration-300"
                    style={{
                      height: `${percentage}%`,
                      minHeight: '4px'
                    }}
                    title={`${state.timeRange === '24hours' ? `${index}시` : 
                           state.timeRange === '7days' ? `${index + 1}일` : 
                           `${index + 1}일`}: ${height}%`}
                    aria-label={`${state.timeRange === '24hours' ? `${index}시` : 
                               state.timeRange === '7days' ? `${index + 1}일` : 
                               `${index + 1}일`} 데이터: ${height}%`}
                  />
                );
              })}
            </div>
            <div className="text-xs text-gray-500 text-center mt-1">
              {state.timeRange === '24hours' ? '시간별 트렌드' :
               state.timeRange === '7days' ? '주간 트렌드' : '월간 트렌드'}
            </div>
          </div>
        )}
      </div>

      {/* 선택된 메트릭 상세 정보 */}
      {state.selectedMetric && (
        <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
          <div className="text-xs text-blue-600 font-medium mb-1">
            {state.selectedMetric} 상세 분석
          </div>
          <div className="text-xs text-gray-600">
            {state.timeRange === '24hours' ? '최근 24시간' :
             state.timeRange === '7days' ? '최근 7일' : '최근 30일'} 동안의 
            {state.selectedMetric === '방문자' ? ' 고유 방문자 수' :
             state.selectedMetric === '페이지뷰' ? ' 페이지 조회 수' :
             state.selectedMetric === '체류시간' ? ' 평균 체류 시간' :
             ' 이탈률'} 변화를 보여줍니다.
          </div>
        </div>
      )}
    </div>
  );
};
