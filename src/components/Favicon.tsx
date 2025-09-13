import React from "react";
import { BrandLogo } from "./BrandLogo";

const FallbackIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 16,
  className,
}) => (
  <img
    src="/icons/fallback-question.svg"
    width={size}
    height={size}
    className={className}
    alt=""
  />
);

const isInternalDomain = (domain: string) => {
  try {
    const url = new URL(domain.startsWith("http") ? domain : `https://${domain}`);
    return url.hostname.endsWith("urwebs.com");
  } catch {
    return false;
  }
};

export const Favicon: React.FC<{
  domain?: string;
  size?: number;
  className?: string;
}> = ({ domain, size = 16, className }) => {
  const [err, setErr] = React.useState(false);
  if (!domain) return <FallbackIcon size={size} className={className} />;
  if (isInternalDomain(domain))
    return <BrandLogo size={size} className={className} />;
  if (err) return <FallbackIcon size={size} className={className} />;
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      onError={() => setErr(true)}
      alt=""
      width={size}
      height={size}
      className={className}
      loading="lazy"
    />
  );
};

export default Favicon;
