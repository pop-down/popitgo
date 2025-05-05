import { writable } from 'svelte/store';
import { supabase, getCurrentUser } from '../services/supabase';
import type { User } from '@supabase/supabase-js';

// 사용자 정보 인터페이스
export interface UserInfo {
  id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  role?: string; // 'user', 'admin', 'super_admin'
}

// 인증 상태 인터페이스
export interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: UserInfo | null;
  error: string | null;
}

// 초기 인증 상태
const initialState: AuthState = {
  isLoggedIn: false,
  isLoading: true,
  user: null,
  error: null,
};

// 인증 스토어 생성
function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  // 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    try {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      const user = await getCurrentUser();
      
      if (user) {
        // 사용자 프로필 정보 가져오기 (역할 포함)
        const { data: profile, error: profileError } = await supabase
          .from('resv_profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('프로필 정보를 가져오는데 실패했습니다:', profileError.message);
        }
          
        // Supabase 사용자 데이터를 내부 형식으로 변환
        const userInfo: UserInfo = {
          id: user.id,
          email: user.email || undefined,
          fullName: user.user_metadata?.full_name,
          avatarUrl: user.user_metadata?.avatar_url,
          role: profile?.role || 'user',
        };
        
        set({
          isLoggedIn: true,
          isLoading: false,
          user: userInfo,
          error: null,
        });
      } else {
        // 로그인하지 않은 상태
        set({
          isLoggedIn: false,
          isLoading: false,
          user: null,
          error: null,
        });
      }
    } catch (error) {
      // 오류 처리
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : '인증 상태를 확인하는 중 오류가 발생했습니다',
      }));
    }
  };

  // 관리자 권한 확인
  const checkAdminAccess = async (): Promise<{isAdmin: boolean, role?: string}> => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return { isAdmin: false };
      }
      
      const { data: profile, error } = await supabase
        .from('resv_profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (error) {
        throw error;
      }
      
      const isAdmin = profile && ['admin', 'super_admin'].includes(profile.role);
      return {
        isAdmin,
        role: profile?.role
      };
    } catch (error) {
      console.error('관리자 권한 확인 중 오류:', error);
      return { isAdmin: false };
    }
  };

  // 카카오 로그인 처리
  const login = async () => {
    try {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다',
      }));
    }
  };
  
  // 구글 로그인 처리
  const loginWithGoogle = async () => {
    try {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : '구글 로그인 중 오류가 발생했습니다',
      }));
    }
  };

  // 로그아웃 처리
  const logout = async () => {
    try {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      set({
        isLoggedIn: false,
        isLoading: false,
        user: null,
        error: null,
      });
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : '로그아웃 중 오류가 발생했습니다',
      }));
    }
  };

  // 인증 상태 변경 구독
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      fetchUserInfo();
    } else if (event === 'SIGNED_OUT') {
      set({
        isLoggedIn: false,
        isLoading: false,
        user: null,
        error: null,
      });
    }
  });

  // 초기 상태 로드
  fetchUserInfo();

  return {
    subscribe,
    login,
    loginWithGoogle,
    logout,
    refresh: fetchUserInfo,
    checkAdminAccess
  };
}

// 인증 스토어 내보내기
export const authStore = createAuthStore(); 