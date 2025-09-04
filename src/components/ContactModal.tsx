import React, { useState, useEffect } from 'react'; // React 라이브러리와 핵심 훅을 가져옵니다.
import { toast } from "sonner";

interface ContactModalProps { // 컴포넌트가 받는 props의 타입을 정의합니다.
  isOpen: boolean; // 모달 창이 열려있는지 여부를 나타냅니다.
  onClose: () => void; // 모달 창을 닫는 함수입니다.
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) { // ContactModal 컴포넌트를 정의합니다.
  const [email, setEmail] = useState(''); // 사용자의 이메일을 저장하는 상태입니다.
  const [message, setMessage] = useState(''); // 사용자의 문의 내용을 저장하는 상태입니다.

  useEffect(() => { // 모달 창이 열렸을 때 키보드 이벤트를 처리하기 위한 효과(effect)입니다.
    const handleEscape = (e: KeyboardEvent) => { // 'Escape' 키를 눌렀을 때 모달을 닫는 함수입니다.
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) { // 모달이 열려 있을 때만 키보드 이벤트 리스너를 추가합니다.
      document.addEventListener('keydown', handleEscape);
    }

    return () => { // 컴포넌트가 언마운트되거나 'isOpen' 상태가 변경될 때 이벤트 리스너를 제거합니다.
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]); // 'isOpen' 또는 'onClose'가 변경될 때만 이 효과가 재실행됩니다.

  const handleSubmit = () => { // '문의내용 보내기' 버튼 클릭 시 실행되는 함수입니다.
    if (!email || !message) { // 필수 입력 필드가 비어 있는지 확인합니다.
      toast.error('이메일과 문의내용을 입력해주세요.');
      return;
    }

    const subject = encodeURIComponent('SFU 문의사항'); // 이메일 제목을 URL에 맞게 인코딩합니다.
    const body = encodeURIComponent(`답변받을 이메일: ${email}

문의내용:
${message}`); // 이메일 본문 내용을 URL에 맞게 인코딩합니다.
    
    window.location.href = `mailto:okjsk1@gmail.com?subject=${subject}&body=${body}`; // 기본 이메일 클라이언트를 실행하고, 제목과 본문을 채워넣습니다.
    
    // 폼 초기화
    setEmail('');
    setMessage('');
    onClose(); // 모달 창을 닫습니다.
  };

  const handleBackdropClick = (e: React.MouseEvent) => { // 모달 바깥 영역(배경)을 클릭했을 때 모달을 닫는 함수입니다.
    if (e.target === e.currentTarget) { // 클릭된 요소가 현재 요소(가장 바깥쪽 div)와 동일한지 확인합니다.
      onClose(); // 동일하면 모달을 닫습니다.
    }
  };

  if (!isOpen) return null; // 'isOpen'이 false이면 아무것도 렌더링하지 않습니다.

  return ( // 모달의 JSX를 렌더링합니다.
    <div 
      className={`sfu-modal ${isOpen ? 'open' : ''}`} // 모달 상태에 따라 'open' 클래스를 추가합니다.
      onClick={handleBackdropClick} // 배경 클릭 이벤트 핸들러를 연결합니다.
      role="dialog" // 접근성을 위해 역할을 'dialog'로 설정합니다.
      aria-modal="true" // 모달임을 알리는 속성을 추가합니다.
      aria-hidden={!isOpen} // 모달이 닫혀 있을 때 화면 리더기가 무시하도록 합니다.
    >
      <div className="sfu-modal-content"> {/* 모달 내용 컨테이너입니다. */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#f0f0f0' }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--main-point)' }}>
            문의하기 {/* 모달 제목입니다. */}
          </h2>
          <button
            onClick={onClose} // 클릭 시 모달 닫기 함수를 호출합니다.
            className="border-0 bg-transparent cursor-pointer text-gray-700"
            style={{ fontSize: '1.4rem', lineHeight: 1 }}
            aria-label="닫기" // 접근성을 위한 닫기 버튼 레이블입니다.
          >
            &times; {/* 닫기 아이콘(x)입니다. */}
          </button>
        </div>
        
        <div className="p-3">
          <input
            type="email"
            className="sfu-form-input"
            placeholder="답변받을 이메일"
            value={email} // 이메일 상태와 입력 필드를 연결합니다.
            onChange={(e) => setEmail(e.target.value)} // 입력 값 변경 시 이메일 상태를 업데이트합니다.
          />
        </div>
        
        <div className="p-3">
          <textarea
            className="sfu-form-textarea min-h-24 resize-y"
            placeholder="문의내용을 입력해주세요"
            value={message} // 문의 내용 상태와 입력 필드를 연결합니다.
            onChange={(e) => setMessage(e.target.value)} // 입력 값 변경 시 문의 내용 상태를 업데이트합니다.
          />
        </div>
        
        <div className="mx-4 mb-4">
          <button 
            className="sfu-btn-primary w-full"
            onClick={handleSubmit} // 클릭 시 제출 함수를 호출합니다.
            style={{ fontSize: '1rem' }}
          >
            📤 문의내용 보내기 {/* 제출 버튼입니다. */}
          </button>
        </div>
      </div>
    </div>
  );
}