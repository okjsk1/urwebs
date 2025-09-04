import React from 'react';

interface AdBannerProps {
  text: string;
}

export function AdBanner({ text }: AdBannerProps) {
  return (
    <div 
      className="flex items-center justify-center text-center h-35 rounded-xl border-2 border-dashed"
      style={{
        background: '#f8f8f8',
        borderColor: '#ececec',
        color: '#c0b2b7',
        fontSize: '13px',
        height: '140px'
      }}
    >
      <div className="flex flex-col items-center">
        <div style={{ fontSize: '19px', marginBottom: '0.5rem' }}>📢</div>
        {text}
      </div>
    </div>
  );
}