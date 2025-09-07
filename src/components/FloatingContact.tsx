import React from 'react';

interface FloatingContactProps {
  onContactClick: () => void;
}

export function FloatingContact({ onContactClick }: FloatingContactProps) {
  return (
    <div className="fixed left-5 bottom-5 z-30">
      <button
        className="urwebs-floating-contact px-4 py-3"
        onClick={onContactClick}
        style={{ fontSize: '1.05rem' }}
      >
        💬 문의하기
      </button>
    </div>
  );
}