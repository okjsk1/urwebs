import { useEffect, useState, useCallback } from "react";
import { db, auth } from "../firebase/config";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { systemSettingsSchema, DEFAULT_SETTINGS, SystemSettings } from "../types/system-settings";

export function useSystemSettings() {
  const [data, setData] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ref = doc(db, "system", "settings");
    const unsub = onSnapshot(
      ref, 
      (snap) => {
        try {
          const raw = snap.data();
          if (raw) {
            const parsed = systemSettingsSchema.safeParse(raw);
            if (parsed.success) {
              setData(parsed.data);
              setError(null);
            } else {
              console.warn("시스템 설정 스키마 검증 실패:", parsed.error);
              setData(DEFAULT_SETTINGS);
              setError("설정 데이터 형식이 올바르지 않습니다");
            }
          } else {
            setData(DEFAULT_SETTINGS);
            setError(null);
          }
        } catch (err) {
          console.error("시스템 설정 로드 실패:", err);
          setData(DEFAULT_SETTINGS);
          setError("설정을 불러오는데 실패했습니다");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Firestore 연결 실패:", err);
        setData(DEFAULT_SETTINGS);
        setError("데이터베이스 연결에 실패했습니다");
        setLoading(false);
      }
    );
    
    return () => unsub();
  }, []);

  const save = useCallback(async (next: SystemSettings) => {
    try {
      // 관리자 권한 확인
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.email !== "okjsk1@gmail.com") {
        throw new Error("NOT_AUTHORIZED");
      }

      // 스키마 검증
      const parsed = systemSettingsSchema.parse(next);
      
      // Firestore에 저장
      await setDoc(doc(db, "system", "settings"), parsed, { merge: true });
      
      setError(null);
    } catch (err: any) {
      console.error("시스템 설정 저장 실패:", err);
      if (err.message === "NOT_AUTHORIZED") {
        throw new Error("NOT_AUTHORIZED");
      }
      throw new Error("저장 중 오류가 발생했습니다");
    }
  }, []);

  return { 
    data, 
    loading, 
    error, 
    save,
    isAdmin: auth.currentUser?.email === "okjsk1@gmail.com"
  };
}


