// Supabase 클라이언트 설정 파일
// 실제 프로젝트에서는 환경변수로 관리해야 합니다.
import { logger } from "./logger";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Supabase 프로젝트 설정 (실제 값으로 교체 필요)
export const supabaseConfig: SupabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
};

// 사용자 데이터 타입 정의
export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

// 즐겨찾기 데이터 타입 (Supabase용)
export interface UserFavorites {
  id: string;
  user_id: string;
  favorites_data: any; // JSON 형태의 즐겨찾기 데이터
  created_at: string;
  updated_at: string;
}

// Supabase 테이블 스키마 안내
export const DATABASE_SCHEMA = {
  // 사용자 프로필 테이블
  profiles: {
    id: 'uuid (foreign key to auth.users)',
    email: 'text',
    name: 'text',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },
  
  // 사용자 즐겨찾기 테이블
  user_favorites: {
    id: 'uuid (primary key)',
    user_id: 'uuid (foreign key to profiles.id)',
    favorites_data: 'jsonb', // 즐겨찾기 데이터 (folders, items, widgets)
    created_at: 'timestamp',
    updated_at: 'timestamp'
  }
};

// Supabase 설정을 위한 SQL 스크립트 예제
export const SETUP_SQL = `
-- 사용자 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 즐겨찾기 테이블 생성
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  favorites_data JSONB NOT NULL DEFAULT '{"items": [], "folders": [], "widgets": []}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- 정책 생성 (사용자는 자신의 데이터만 접근 가능)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own favorites" ON user_favorites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거 생성
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_favorites_updated_at 
  BEFORE UPDATE ON user_favorites 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

// Mock 함수들 (실제 Supabase 연결 전까지 사용)
export const mockAuthFunctions = {
  signUp: async (email: string, password: string, name: string) => {
    logger.info('Mock signUp:', { email, name });
    return { user: { id: 'mock-user-id', email, name }, error: null };
  },

  signIn: async (email: string, password: string) => {
    logger.info('Mock signIn:', { email });
    return { user: { id: 'mock-user-id', email }, error: null };
  },

  signOut: async () => {
    logger.info('Mock signOut');
    return { error: null };
  },

  getCurrentUser: async () => {
    logger.info('Mock getCurrentUser');
    return { user: null, error: null };
  },

  saveFavorites: async (userId: string, favoritesData: any) => {
    logger.info('Mock saveFavorites:', { userId, favoritesData });
    return { data: favoritesData, error: null };
  },

  loadFavorites: async (userId: string) => {
    logger.info('Mock loadFavorites:', { userId });
    return { data: null, error: null };
  }
};