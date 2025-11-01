import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

/**
 * 이미지를 Firebase Storage에 업로드하고 다운로드 URL을 반환합니다.
 * @param file 업로드할 이미지 파일
 * @param userId 사용자 ID (경로에 사용)
 * @param folder 업로드할 폴더 경로 (예: 'backgrounds', 'avatars')
 * @returns 업로드된 이미지의 다운로드 URL
 */
/**
 * 재시도 로직이 포함된 이미지 업로드
 */
async function uploadWithRetry(
  storageRef: any,
  file: Blob,
  contentType: string,
  maxRetries: number = 2, // 재시도 횟수 감소 (3 -> 2)
  retryDelay: number = 3000 // 재시도 간격 증가 (2초 -> 3초)
): Promise<any> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // 로그는 첫 시도만 출력 (반복 로그 방지)
      if (attempt === 0) {
        console.log(`이미지 업로드 시작...`);
      }
      
      // 타임아웃 설정 (15초로 단축)
      const uploadPromise = uploadBytes(storageRef, file, { contentType });
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('업로드 타임아웃')), 15000);
      });
      
      const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
      if (attempt === 0) {
        console.log('업로드 성공!');
      }
      return snapshot;
    } catch (error: any) {
      lastError = error;
      
      // 마지막 시도가 아니면 재시도 (경고 로그는 한 번만)
      if (attempt < maxRetries - 1) {
        if (attempt === 0) {
          console.warn(`업로드 재시도 중... (${attempt + 2}/${maxRetries})`);
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      } else {
        // 최종 실패 시에만 에러 로그
        console.error('이미지 업로드 최종 실패:', error.code || error.message);
      }
    }
  }
  
  throw lastError;
}

export async function uploadImage(
  file: File,
  userId: string,
  folder: string = 'backgrounds'
): Promise<string> {
  try {
    // 1) 작은 파일(500KB 이하)은 리사이즈 생략
    const shouldResize = file.size > 500 * 1024;
    const processed = shouldResize 
      ? await preprocessImage(file, { maxSize: 2560, quality: 0.85 })
      : file;

    // 2) 파일명/경로
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    const storageRef = ref(storage, `${folder}/${userId}/${fileName}`);

    // 3) 재시도 로직이 포함된 업로드
    const snapshot = await uploadWithRetry(
      storageRef,
      processed,
      processed.type || 'image/jpeg'
    );
    
    // 4) 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error: any) {
    console.error('이미지 업로드 최종 실패:', error);
    
    // Firebase Storage 업로드 실패 시 base64 fallback 제공
    if (error.code === 'storage/retry-limit-exceeded' || error.code === 'storage/unauthorized') {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          console.warn('Firebase Storage 업로드 실패, base64 사용:', base64.substring(0, 50) + '...');
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
    
    throw new Error(`이미지 업로드 실패: ${error.message || '알 수 없는 오류'}`);
  }
}

/** 이미지 리사이즈/압축 (캔버스 이용) */
export async function preprocessImage(
  file: File,
  options: { maxSize: number; quality: number } = { maxSize: 2560, quality: 0.85 }
): Promise<Blob> {
  // 이미지가 아닌 경우 원본 반환
  if (!file.type.startsWith('image/')) return file;

  const dataUrl = await readFileAsDataURL(file);
  const img = await loadImage(dataUrl);

  const { maxSize, quality } = options;
  const { width, height } = getContainSize(img.width, img.height, maxSize);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, width, height);

  // JPEG로 저장 (투명 배경은 흰색으로 합성되어 저장됨)
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  );
  return blob || file;
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function getContainSize(w: number, h: number, max: number): { width: number; height: number } {
  const longer = Math.max(w, h);
  if (longer <= max) return { width: w, height: h };
  const scale = max / longer;
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

/**
 * 이미지 파일 유효성 검사
 * @param file 검사할 파일
 * @param maxSizeMB 최대 파일 크기 (MB)
 * @returns 검사 결과 및 에러 메시지
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  // 파일 타입 검사
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: '이미지 파일만 업로드 가능합니다.' };
  }

  // 파일 크기 검사
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `파일 크기는 ${maxSizeMB}MB 이하여야 합니다.` };
  }

  return { valid: true };
}

