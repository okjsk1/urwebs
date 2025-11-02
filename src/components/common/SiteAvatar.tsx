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
  
  // 품질 기반 파비콘 로드 (silent fallback)
  useEffect(() => {
    const loadFavicon = async () => {
      try {
        const candidates = buildFaviconCandidates(url);
        const bestIcon = await pickBestIcon(candidates, 24);
        
        if (isAliveRef.current) {
          if (bestIcon) {
            setFaviconSrc(bestIcon);
          }
        }
      } catch (error) {
        // 에러 발생 시 silent fallback (console.error 대신 debug)
        if ((import.meta as any).env?.DEV) {
          console.debug('[SiteAvatar] Favicon 로드 실패:', url, error);
        }
        // faviconError는 이미 기본값 false이므로 초기화 불필요
      }
    };

    loadFavicon();

    return () => {
      isAliveRef.current = false;
    };
  }, [url]);
  
  const showFavicon = !faviconError && !!faviconSrc;
  const style = {
    backgroundColor: showFavicon ? 'rgba(255,255,255,0.9)' : bgColor,
    color: showFavicon ? undefined : textColor,
    width: `${size}px`,
    height: `${size}px`,
    fontSize: size <= 20 ? '8px' : size <= 24 ? '9px' : size <= 28 ? '10px' : '12px'
  } as React.CSSProperties;
  
  const handleFaviconError = () => {
    // Silent fallback: 에러 로그 제거, 상태만 업데이트
    setFaviconError(true);
    // console.error 제거, 필요 시 console.debug만 사용
    if ((import.meta as any).env?.DEV) {
      console.debug('[SiteAvatar] Favicon 이미지 로드 실패:', faviconSrc);
    }
  };
  
  return (
    <div
      className={`flex items-center justify-center font-bold overflow-hidden ring-1 ring-white/50 transition-colors hover:ring-white/60 ${sizeClass} ${roundedClass} ${className}`}
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

