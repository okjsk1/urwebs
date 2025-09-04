import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { logger } from "../lib/logger";

interface LoginModalProps {
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      logger.info('이메일/비밀번호 로그인 성공!');
      onClose(); // 로그인 성공 시 모달 닫기
    } catch (error: any) {
      console.error('로그인 실패:', error.code, error.message);
      setError('로그인 실패: 이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      logger.info('구글 로그인 성공!');
      onClose(); // 로그인 성공 시 모달 닫기
    } catch (error: any) {
      console.error('구글 로그인 실패:', error.message);
      setError('구글 로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>로그인</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
          />
          <button type="submit">로그인</button>
        </form>
        
        <button onClick={handleGoogleLogin} style={{ marginTop: '10px' }}>
          Google로 로그인
        </button>
        
        {error && <p className="error-message">{error}</p>}
        <p>
          계정이 없으신가요? <button onClick={onSwitchToSignup}>회원가입</button>
        </p>
      </div>
    </div>
  );
};