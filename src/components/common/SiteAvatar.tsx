// SiteAvatar - 북마크/링크 아이콘 컴포넌트 (고해상도 품질 검사)
import React, { useState, useEffect, useRef } from 'react';
import { getBrandColor, getInitials, pickTextColor } from '../../utils/brand';
import { buildFaviconCandidates } from '../../utils/icon-source';
import { pickBestIcon } from '../../utils/icon-quality';

export interface SiteAvatarProps {
  url: string;
  name?: string;
  size?: number;
  className?: string;
  rounded?: 'full' | 'lg';
}

export const SiteAvatar = React.memo<SiteAvatarProps>(({
  url,
  name,
  size = 28,
  className = '',
  rounded = 'full'
}) => {
  const [faviconSrc, setFaviconSrc] = useState<string | null>(null);
  const [faviconError, setFaviconError] = useState(false);
  const isAliveRef = useRef(true);
  
  const bgColor = getBrandColor(url);
  const textColor = pickTextColor(bgColor);
  const initials = getInitials(name, url);
  
  const sizeClass = `w-${size} h-${size}`;
  const textSize = size <= 20 ? 'text-[8px]' : size <= 24 ? 'text-[9px]' : size <= 28 ? 'text-[10px]' : 'text-[12px]';
  const roundedClass = rounded === 'full' ? 'rounded-full' : 'rounded-lg';
  
  // 품질 기반 파비콘 로드
  useEffect(() => {
    const loadFavicon = async () => {
      const candidates = buildFaviconCandidates(url);
      const bestIcon = await pickBestIcon(candidates, 24);
      
      if (isAliveRef.current) {
        if (bestIcon) {
          setFaviconSrc(bestIcon);
        }
      }
    };

    loadFavicon();

    return () => {
      isAliveRef.current = false;
    };
  }, [url]);
  
  const style = {
    backgroundColor: bgColor,
    color: textColor,
    width: `${size}px`,
    height: `${size}px`,
    fontSize: size <= 20 ? '8px' : size <= 24 ? '9px' : size <= 28 ? '10px' : '12px'
  };
  
  const handleFaviconError = () => {
    setFaviconError(true);
  };
  
  return (
    <div
      className={`flex items-center justify-center font-bold ring-1 ring-black/5 transition-all hover:ring-2 hover:ring-black/10 ${sizeClass} ${roundedClass} ${className}`}
      style={style}
      aria-hidden="true"
      title={name}
    >
      {faviconError || !faviconSrc ? (
        <span className={textSize}>{initials}</span>
      ) : (
        <img
          src={faviconSrc}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={handleFaviconError}
          className="w-full h-full object-contain"
          style={{
            borderRadius: rounded === 'full' ? '50%' : '0.5rem'
          }}
        />
      )}
      <span className="sr-only">{name || url}</span>
    </div>
  );
});

SiteAvatar.displayName = 'SiteAvatar';

