/**
 * Stealth Mode 패널형 레이아웃
 * 화면을 상단(검색/시계), 중단(핵심 2~3 위젯), 하단(북마크/메모) 3단 패널로 정렬
 */

import React from 'react';

interface StealthLayoutProps {
  topBar?: React.ReactNode; // 검색/시계
  mainPanel?: React.ReactNode; // 핵심 위젯 2~3개
  bottomPanel?: React.ReactNode; // 북마크/메모
  className?: string;
}

export function StealthLayout({ 
  topBar, 
  mainPanel, 
  bottomPanel,
  className = ''
}: StealthLayoutProps) {
  return (
    <div 
      className={`min-h-screen ${className}`}
      style={{
        backgroundColor: 'var(--stealth-bg)',
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '24px',
      }}
    >
      {/* 상단 패널 - 검색/시계 */}
      {topBar && (
        <div
          style={{
            marginBottom: '24px',
            backgroundColor: 'var(--stealth-surface)',
            border: '1px solid var(--stealth-border)',
            borderRadius: 'var(--stealth-radius)',
            padding: 'var(--stealth-spacing-card-large)',
            boxShadow: 'var(--stealth-shadow)',
          }}
        >
          {topBar}
        </div>
      )}

      {/* 중단 패널 - 핵심 위젯 */}
      {mainPanel && (
        <div
          style={{
            marginBottom: '24px',
            backgroundColor: 'var(--stealth-surface)',
            border: '1px solid var(--stealth-border)',
            borderRadius: 'var(--stealth-radius)',
            padding: 'var(--stealth-spacing-card-large)',
            boxShadow: 'var(--stealth-shadow)',
          }}
        >
          {mainPanel}
        </div>
      )}

      {/* 하단 패널 - 북마크/메모 */}
      {bottomPanel && (
        <div
          style={{
            backgroundColor: 'var(--stealth-surface)',
            border: '1px solid var(--stealth-border)',
            borderRadius: 'var(--stealth-radius)',
            padding: 'var(--stealth-spacing-card-large)',
            boxShadow: 'var(--stealth-shadow)',
          }}
        >
          {bottomPanel}
        </div>
      )}
    </div>
  );
}

/**
 * 패널 컴포넌트 헬퍼
 */
export function TopBar({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function MainPanel({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function BottomPanel({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

