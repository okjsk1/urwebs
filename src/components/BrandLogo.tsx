import React from 'react';

interface BrandLogoProps {
  variant?: 'default' | 'dark' | 'mono';
  size?: number;
  className?: string;
}

const variantSrc: Record<NonNullable<BrandLogoProps['variant']>, string> = {
  default: '/brand/urwebs-logo.svg',
  dark: '/brand/urwebs-logo-dark.svg',
  mono: '/brand/urwebs-logo.svg',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'default',
  size = 24,
  className,
}) => {
  const src = variantSrc[variant];
  return (
    <img
      src={src}
      width={size}
      height={size}
      className={className}
      alt="URWEBS"
    />
  );
};

export default BrandLogo;
