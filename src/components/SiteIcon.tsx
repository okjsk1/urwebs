import React from 'react';
import { Website } from '../types';
import { Favicon } from './Favicon';
import { BrandLogo } from './BrandLogo';

interface Props {
  website?: Pick<Website, 'icon' | 'emoji' | 'url'>;
  url?: string;
  size?: number;
  className?: string;
}

export function SiteIcon({ website, url, size = 16, className }: Props) {
  const symbol = website?.icon ?? website?.emoji;
  if (symbol) {
    return (
      <span style={{ fontSize: size }} className={className} aria-hidden="true">
        {symbol}
      </span>
    );
  }
  const domain = website?.url ?? url;
  if (domain) {
    const isInternal = domain.includes('urwebs.com');
    if (isInternal) {
      return <BrandLogo size={size} className={className} />;
    }
    return <Favicon domain={domain} size={size} className={className} />;
  }
  return (
    <span style={{ fontSize: size }} className={className} aria-hidden="true">
      🌐
    </span>
  );
}

export default SiteIcon;
