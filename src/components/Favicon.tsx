import React from "react";

const FallbackIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <img src="/favicon.svg" width={size} height={size} className={className} alt="" />
);

export const Favicon: React.FC<{ domain: string; size?: number; className?: string }> = ({ domain, size = 16, className }) => {
  const [err, setErr] = React.useState(false);
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
