// 테마 초기화 스크립트 (Flicker 방지)
export function initializeTheme(): void {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  
  // 즉시 테마 적용 (FOUC 방지)
  document.documentElement.setAttribute('data-theme', theme);
  
  // 클래스도 함께 설정 (기존 시스템과 호환)
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// 시스템 테마 변경 감지
export function watchSystemTheme(): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e: MediaQueryListEvent) => {
    const saved = localStorage.getItem('theme');
    // 저장된 테마가 없을 때만 시스템 테마 따름
    if (!saved) {
      const theme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
  
  // 정리 함수 반환
  return () => mediaQuery.removeEventListener('change', handleChange);
}

// 테마 토글 함수
export function toggleTheme(): 'light' | 'dark' {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = current === 'light' ? 'dark' : 'light';
  
  // 즉시 적용
  document.documentElement.setAttribute('data-theme', newTheme);
  
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // 로컬 스토리지에 저장
  localStorage.setItem('theme', newTheme);
  
  return newTheme;
}

// 현재 테마 가져오기
export function getCurrentTheme(): 'light' | 'dark' {
  return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light';
}
<<<<<<< HEAD
=======


>>>>>>> f18eacae9db3a659b475638dca7b7d0b0ae30bd6
