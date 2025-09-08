import React from "react";

const FallbackIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <text x="12" y="16" textAnchor="middle" fontSize="10">
      W
    </text>
  </svg>
);

export const Favicon: React.FC<{ domain: string; size?: number; className?: string }> = ({
  domain,
  size = 16,
  className,
}) => {
  const [err, setErr] = React.useState(false);

  const hostname = React.useMemo(() => {
    try {
      return new URL(domain).hostname;
    } catch {
      return domain;
    }
  }, [domain]);

  const src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;

  if (err) return <FallbackIcon size={size} className={className} />;

  return (
    <img
      src={src}
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
