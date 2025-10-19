/**
 * 스파크라인 컴포넌트
 * 간단한 SVG 기반 미니 차트
 */

import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data = [],
  width = 60,
  height = 16,
  color = 'currentColor',
  className = ''
}) => {
  if (data.length === 0) {
    return <div style={{ width, height }} className={className} />;
  }
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  // 포인트 생성
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg 
      width={width} 
      height={height} 
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * 미니 바 차트
 */
interface MiniBarChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export const MiniBarChart: React.FC<MiniBarChartProps> = ({
  data = [],
  width = 80,
  height = 24,
  color = '#3b82f6'
}) => {
  if (data.length === 0) return null;
  
  const max = Math.max(...data, 1);
  const barWidth = width / data.length - 1;
  
  return (
    <svg width={width} height={height}>
      {data.map((value, index) => {
        const barHeight = (value / max) * height;
        const x = index * (barWidth + 1);
        const y = height - barHeight;
        
        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill={color}
            rx={1}
          />
        );
      })}
    </svg>
  );
};

















