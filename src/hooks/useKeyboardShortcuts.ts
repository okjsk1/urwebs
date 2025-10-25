import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcutsConfig {
  onDuplicate?: () => void;
  onDelete?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onSelectAll?: () => void;
}

export const useKeyboardShortcuts = (config?: KeyboardShortcutsConfig) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K: 검색 (향후 구현)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // 검색 기능 구현 시 사용
        console.log('검색 단축키');
      }

      // Ctrl/Cmd + /: 도움말
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        // 도움말 모달 열기
        console.log('도움말 단축키');
      }

      // Ctrl/Cmd + D: 복제
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        config?.onDuplicate?.();
      }

      // Ctrl/Cmd + Delete: 삭제
      if ((event.ctrlKey || event.metaKey) && event.key === 'Delete') {
        event.preventDefault();
        config?.onDelete?.();
      }

      // Ctrl/Cmd + Z: 실행취소
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        config?.onUndo?.();
      }

      // Ctrl/Cmd + Shift + Z 또는 Ctrl/Cmd + Y: 재실행
      if ((event.ctrlKey || event.metaKey) && (event.shiftKey && event.key === 'z' || event.key === 'y')) {
        event.preventDefault();
        config?.onRedo?.();
      }

      // Ctrl/Cmd + S: 저장
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        config?.onSave?.();
      }

      // Ctrl/Cmd + A: 전체 선택
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        // 입력 필드에 포커스가 있으면 기본 동작 허용
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }
        event.preventDefault();
        config?.onSelectAll?.();
      }

      // Escape: 모달 닫기
      if (event.key === 'Escape') {
        // 모든 모달 닫기
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach(modal => {
          const closeButton = modal.querySelector('[aria-label*="닫기"], [aria-label*="취소"]');
          if (closeButton) {
            (closeButton as HTMLElement).click();
          }
        });
      }

      // 숫자 키로 빠른 네비게이션
      if (event.altKey && !event.ctrlKey && !event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            navigate('/');
            break;
          case '2':
            event.preventDefault();
            navigate('/notice');
            break;
          case '3':
            event.preventDefault();
            navigate('/community');
            break;
          case '4':
            event.preventDefault();
            navigate('/contact');
            break;
          case '5':
            event.preventDefault();
            navigate('/mypage');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, config]);
};

