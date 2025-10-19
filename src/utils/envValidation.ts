// 환경변수 검증 유틸리티
export interface FirebaseEnvSchema {
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
  VITE_FIREBASE_APPCHECK_KEY?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Firebase 환경변수 검증
export function validateFirebaseEnv(env = import.meta.env): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 필수 환경변수 검증
  const requiredKeys: (keyof FirebaseEnvSchema)[] = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  for (const key of requiredKeys) {
    const value = env[key];
    if (!value) {
      errors.push(`Missing required environment variable: ${key}`);
    } else if (value.length < 10) {
      warnings.push(`Environment variable ${key} seems too short`);
    }
  }

  // 선택적 환경변수 검증
  const appCheckKey = env.VITE_FIREBASE_APPCHECK_KEY;
  if (env.MODE === 'production' && !appCheckKey) {
    warnings.push('VITE_FIREBASE_APPCHECK_KEY not set for production mode');
  }

  // API Key 형식 검증 (간단한 체크)
  const apiKey = env.VITE_FIREBASE_API_KEY;
  if (apiKey && !apiKey.startsWith('AIza')) {
    warnings.push('VITE_FIREBASE_API_KEY format seems incorrect (should start with "AIza")');
  }

  // Project ID 형식 검증
  const projectId = env.VITE_FIREBASE_PROJECT_ID;
  if (projectId && !/^[a-z0-9-]+$/.test(projectId)) {
    warnings.push('VITE_FIREBASE_PROJECT_ID should contain only lowercase letters, numbers, and hyphens');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// 빌드 타임 검증 (개발/빌드 시 실행)
export function validateEnvAtBuildTime(): void {
  const result = validateFirebaseEnv();
  
  if (result.errors.length > 0) {
    console.error('❌ Environment validation failed:');
    result.errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Environment validation failed');
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️ Environment validation warnings:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  console.info('✅ Environment validation passed');
}

// 런타임 검증 (앱 시작 시 실행)
export function validateEnvAtRuntime(): ValidationResult {
  const result = validateFirebaseEnv();
  
  if (result.errors.length > 0) {
    console.error('❌ Runtime environment validation failed:');
    result.errors.forEach(error => console.error(`  - ${error}`));
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️ Runtime environment validation warnings:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  return result;
}
