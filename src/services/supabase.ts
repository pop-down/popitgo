import { createClient } from '@supabase/supabase-js';

// Supabase 환경 변수
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 사용자 인증 상태 확인
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('사용자 정보를 가져오는 중 오류 발생:', error);
    return null;
  }
  return data?.user || null;
};

// 카카오 로그인
export const signInWithKakao = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) {
    console.error('카카오 로그인 중 오류 발생:', error);
    throw error;
  }
  
  return data;
};

// 로그아웃
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('로그아웃 중 오류 발생:', error);
    throw error;
  }
  return true;
}; 