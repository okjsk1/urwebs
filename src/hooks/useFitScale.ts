import { useLayoutEffect, useRef, useState } from 'react';

interface Options {
  enabled?: boolean;
  minScale?: number;   // 너무 작아지지 않도록 하한
  padding?: number;    // 컨테이너 내부 여백 고려
}

export function useFitScale<TContainer extends HTMLElement, TContent extends HTMLElement>(
  { enabled = true, minScale = 0.6, padding = 8 }: Options = {}
) {
  const containerRef = useRef<TContainer>(null);
  const contentRef   = useRef<TContent>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    if (!enabled) return;

    const ro = new ResizeObserver(() => {
      const c = containerRef.current;
      const x = contentRef.current;
      if (!c || !x) return;

      const contentWidth  = x.scrollWidth;
      const contentHeight = x.scrollHeight;

      const availW = Math.max(0, c.clientWidth  - padding * 2);
      const availH = Math.max(0, c.clientHeight - padding * 2);
      if (contentWidth === 0 || contentHeight === 0 || availW === 0 || availH === 0) return;

      const next = Math.max(
        Math.min(availW / contentWidth, availH / contentHeight, 1),
        minScale
      );
      setScale(next);
    });

    const c = containerRef.current;
    const x = contentRef.current;
    if (c) ro.observe(c);
    if (x) ro.observe(x);

    return () => ro.disconnect();
  }, [enabled, minScale, padding]);

  return { containerRef, contentRef, scale };
}

