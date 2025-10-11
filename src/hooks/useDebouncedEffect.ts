import { useEffect, DependencyList } from 'react';

/**
 * 디바운스된 useEffect
 * 빈번한 상태 변경 시 저장 호출을 지연시켜 성능 향상
 */
export function useDebouncedEffect(
  fn: () => void,
  deps: DependencyList,
  delay: number = 300
) {
  useEffect(() => {
    const timer = setTimeout(fn, delay);
    return () => clearTimeout(timer);
  }, deps);
}


