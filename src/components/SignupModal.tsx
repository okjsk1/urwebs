import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

interface SignupModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({ onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("회원가입 성공!");
      onClose();
    } catch (err: any) {
      console.error("회원가입 실패:", err.code, err.message);
      setError("회원가입 실패: 유효한 이메일 또는 6자리 이상 비밀번호를 입력해주세요.");
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    try {
      await signInWithPopup(auth, provider);
      console.log("구글 회원가입 및 로그인 성공!");
      onClose();
    } catch (err: any) {
      console.error("구글 회원가입 실패:", err.message);
      setError("구글 계정으로 회원가입에 실패했습니다.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>회원가입</h2>

        <form onSubmit={handleSignup}>
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
            placeholder="비밀번호 (6자리 이상)"
            required
          />
          <button type="submit">회원가입</button>
        </form>

        <button onClick={handleGoogleSignup} style={{ marginTop: "10px" }}>
          Google로 회원가입
        </button>

        {error && <p className="error-message">{error}</p>}

        <p>
          이미 계정이 있으신가요?{" "}
          <button type="button" onClick={onSwitchToLogin}>
            로그인
          </button>
        </p>
      </div>
    </div>
  );
};
