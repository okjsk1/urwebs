import { getStorage, ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';

/**
 * 이미지 업로드 옵션
 */
type UploadImageOpts = {
  path: string;                 // 업로드 경로 (예: 'backgrounds/{uid}/{filename}')
  file: File;                   // 파일
  contentType?: string;         // MIME 타입
  timeoutMs?: number;           // 타임아웃 (기본 15000ms)
  maxRetries?: number;          // 최대 재시도 횟수 (기본 2회)
  onProgress?: (pct: number) => void; // 진행률 콜백
  logger?: (msg: string, ...args: any[]) => void; // 로거 함수
};

/**
 * 타임아웃 및 재시도 로직이 포함된 이미지 업로드 (uploadBytesResumable 기반)
 */
export async function uploadImage({
  path,
  file,
  contentType = file.type || 'image/jpeg',
  timeoutMs = 15000,
  maxRetries = 2,
  onProgress,
  logger = console.debug,
}: UploadImageOpts): Promise<string> {
  const storageInstance = getStorage();
  let attempt = 0;
  let uploadTask: UploadTask | null = null;

  while (true) {
    attempt++;
    const storageRef = ref(storageInstance, path);
    uploadTask = uploadBytesResumable(storageRef, file, { contentType });

    logger(`[upload] start attempt=${attempt}, path=${path}, size=${file.size}, type=${contentType}`);

    const uploadPromise = new Promise<string>((resolve, reject) => {
      uploadTask!.on(
        'state_changed',
        (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress?.(pct);
        },
        (err) => {
          logger('[upload] error in state_changed', { code: err.code, message: err.message });
          reject(err);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask!.snapshot.ref);
            resolve(url);
          } catch (e: any) {
            logger('[upload] getDownloadURL error', e);
            reject(e);
          }
        }
      );
    });

    // 타임아웃: race로 구현
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => {
        try {
          uploadTask?.cancel(); // 업로드 취소
        } catch (e) {
          logger('[upload] cancel error', e);
        }
        reject(new Error('timeout'));
      }, timeoutMs)
    );

    try {
      const url = await Promise.race([uploadPromise, timeoutPromise]);
      logger('[upload] success', { attempt, url: url.substring(0, 50) + '...' });
      return url;
    } catch (err: any) {
      logger('[upload] fail', { attempt, code: err?.code, message: err?.message });

      // 재시도 불가 사유: 권한/취소/잘못된 인자 등
      const hardErrors = new Set([
        'storage/unauthorized',
        'storage/canceled',
        'storage/invalid-argument',
      ]);
      if (hardErrors.has(err?.code)) {
        throw err;
      }

      if (attempt >= maxRetries) {
        throw err;
      }
      
      // 백오프 (0.6s, 1.2s)
      await new Promise((r) => setTimeout(r, 600 * attempt));
    }
  }
}

/**
 * 기존 인터페이스 호환성을 위한 래퍼 함수
 * @deprecated 새로운 uploadImage를 직접 사용하세요
 */
export async function uploadImageLegacy(
  file: File,
  userId: string,
  folder: string = 'backgrounds'
): Promise<string> {
  // 파일명 생성
  const safeName = file.name.replace(/[^\w.-]+/g, '_').slice(0, 80);
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${Date.now()}_${safeName}`;
  const path = `${folder}/${userId}/${fileName}`;

  return uploadImage({
    path,
    file,
    timeoutMs: 15000,
    maxRetries: 2,
    logger: console.debug,
  });
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

