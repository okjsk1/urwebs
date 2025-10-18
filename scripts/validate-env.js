#!/usr/bin/env node

// 빌드 타임 환경변수 검증 스크립트
const fs = require('fs');
const path = require('path');

// .env 파일 읽기
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

// 환경변수 검증
function validateFirebaseEnv() {
  const envPath = path.join(process.cwd(), '.env');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  // .env.local 우선, 없으면 .env 사용
  const env = { ...loadEnvFile(envPath), ...loadEnvFile(envLocalPath) };
  
  const requiredKeys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const errors = [];
  const warnings = [];
  
  // 필수 키 검증
  for (const key of requiredKeys) {
    const value = env[key];
    if (!value) {
      errors.push(`Missing required environment variable: ${key}`);
    } else if (value.length < 10) {
      warnings.push(`Environment variable ${key} seems too short`);
    }
  }
  
  // API Key 형식 검증
  const apiKey = env.VITE_FIREBASE_API_KEY;
  if (apiKey && !apiKey.startsWith('AIza')) {
    warnings.push('VITE_FIREBASE_API_KEY format seems incorrect (should start with "AIza")');
  }
  
  // Project ID 형식 검증
  const projectId = env.VITE_FIREBASE_PROJECT_ID;
  if (projectId && !/^[a-z0-9-]+$/.test(projectId)) {
    warnings.push('VITE_FIREBASE_PROJECT_ID should contain only lowercase letters, numbers, and hyphens');
  }
  
  // App Check 키 검증 (프로덕션)
  if (process.env.NODE_ENV === 'production') {
    const appCheckKey = env.VITE_FIREBASE_APPCHECK_KEY;
    if (!appCheckKey) {
      warnings.push('VITE_FIREBASE_APPCHECK_KEY not set for production build');
    }
  }
  
  return { errors, warnings };
}

// 메인 실행
function main() {
  console.log('🔍 Validating Firebase environment variables...');
  
  const { errors, warnings } = validateFirebaseEnv();
  
  // 프로덕션 환경에서는 환경변수 검증을 건너뛰고 경고만 표시
  const isProduction = process.env.NODE_ENV === 'production' || 
                      process.env.VERCEL === '1' ||
                      process.env.CI === 'true';
  
  if (errors.length > 0) {
    if (isProduction) {
      console.warn('⚠️ Environment validation warnings (continuing build):');
      errors.forEach(error => console.warn(`  - ${error}`));
      console.warn('  - Build will continue, but Firebase features may not work properly');
      console.log('✅ Environment validation completed with warnings (build continuing)');
    } else {
      console.error('❌ Environment validation failed:');
      errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }
  } else {
    console.log('✅ Environment validation passed');
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ Environment validation warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateFirebaseEnv };
