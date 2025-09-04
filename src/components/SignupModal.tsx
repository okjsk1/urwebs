import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";

interface SignupModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({ onClose, onSwitchToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      console.log("회원가입 성공!");
      onClose();
    } catch (err: any) {
      console.error("회원가입 실패:", err.code, err.message);
      setError("회원가입 실패: 다시 시도해주세요.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>회원가입</h2>
        <form onSubmit={handleSignup}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            required
          />
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
          <button type="submit">회원가입</button>
        </form>
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

