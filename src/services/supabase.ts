import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Supabase 환경 변수
// 개발 중에는 하드코딩된 값을 사용할 수 있습니다
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경 변수 확인
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL 또는 Anonymous Key가 설정되지 않았습니다. ' +
    '환경 변수를 올바르게 설정해주세요: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY'
  );
  
  // 개발 환경이면 콘솔에 환경 변수 정보 표시
  if (import.meta.env.DEV) {
    console.log('현재 import.meta.env 내용:', import.meta.env);
    console.log('환경 변수를 .env 파일에 올바르게 설정했는지 확인하세요.');
    console.log('파일 경로: /popitgo/.env');
    console.log('필요한 형식: VITE_SUPABASE_URL=https://your-project-id.supabase.co');
  }
}

// Supabase 클라이언트 생성
let supabaseClient: SupabaseClient | null = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  } else if (import.meta.env.DEV) {
    // 개발 환경에서는 더미 클라이언트를 제공할 수도 있습니다
    console.warn('개발 환경에서 더미 Supabase 클라이언트를 사용합니다. 실제 API 호출은 작동하지 않습니다.');
    supabaseClient = createClient('https://placeholder-url.supabase.co', 'placeholder-key', {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  } else {
    throw new Error('Supabase URL과 Anon Key가 필요합니다.');
  }
} catch (error) {
  console.error('Supabase 클라이언트 생성 실패:', error);
  throw error;
}

export const supabase = supabaseClient;

// 서비스 오류 타입 정의
export interface ServiceError {
  code: string;
  message: string;
  details?: unknown;
}

// 클라이언트측 캐멀 케이스와 서버측 스네이크 케이스 변환 유틸리티
export const transformers = {
  // 서버 데이터(스네이크 케이스)를 클라이언트 모델(캐멀 케이스)로 변환
  fromSupabase: {
    event: (item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      organizer: item.organizer,
      category: item.category,
      reservationStart: item.reservation_start ? new Date(item.reservation_start) : null,
      reservationPlatform: item.reservation_platform,
      reservationLink: item.reservation_link,
      createdAt: item.created_at ? new Date(item.created_at) : null,
      updatedAt: item.updated_at ? new Date(item.updated_at) : null,
      hasNotification: false // 별도로 설정 필요
    }),
    note: (item: any) => ({
      id: item.id,
      userId: item.user_id,
      eventId: item.event_id,
      content: item.content,
      createdAt: item.created_at ? new Date(item.created_at) : null,
      updatedAt: item.updated_at ? new Date(item.updated_at) : null
    }),
    notification: (item: any) => ({
      id: item.id,
      userId: item.user_id,
      eventId: item.event_id,
      type: item.type,
      minutesBefore: item.minutes_before,
      createdAt: item.created_at ? new Date(item.created_at) : null,
      updatedAt: item.updated_at ? new Date(item.updated_at) : null
    })
  },
  
  // 클라이언트 모델(캐멀 케이스)을 서버 데이터(스네이크 케이스)로 변환
  toSupabase: {
    event: (item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      organizer: item.organizer,
      category: item.category,
      reservation_start: item.reservationStart,
      reservation_platform: item.reservationPlatform,
      reservation_link: item.reservationLink
    }),
    note: (item: any) => ({
      id: item.id,
      user_id: item.userId,
      event_id: item.eventId,
      content: item.content
    }),
    notification: (item: any) => ({
      id: item.id,
      user_id: item.userId,
      event_id: item.eventId,
      type: item.type,
      minutes_before: item.minutesBefore
    })
  }
};

// 사용자 인증 상태 확인
export const getCurrentUser = async () => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }
  
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      // AuthSessionMissingError는 비로그인 상태를 의미하므로 오류 로그만 출력하고 null 반환
      if (error.name === 'AuthSessionMissingError') {
        console.log('비로그인 사용자입니다. 제한된 기능을 제공합니다.');
        return null;
      }
      console.error('사용자 정보를 가져오는 중 오류 발생:', error);
      throw createServiceError('AUTH_GET_USER_ERROR', '사용자 정보를 가져오는 중 오류가 발생했습니다.', error);
    }
    return data?.user || null;
  } catch (error) {
    // AuthSessionMissingError는 비로그인 상태를 의미하므로 null 반환
    if (error instanceof Error && error.name === 'AuthSessionMissingError') {
      console.log('비로그인 사용자입니다. 제한된 기능을 제공합니다.');
      return null;
    }
    console.error('현재 사용자 확인 중 예외 발생:', error);
    throw createServiceError('AUTH_UNEXPECTED_ERROR', '사용자 확인 중 예기치 않은 오류가 발생했습니다.', error);
  }
};

// 카카오 로그인
export const signInWithKakao = async () => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      console.error('카카오 로그인 중 오류 발생:', error);
      throw createServiceError('AUTH_KAKAO_ERROR', '카카오 로그인 중 오류가 발생했습니다.', error);
    }
    
    return data;
  } catch (error) {
    console.error('카카오 로그인 중 예외 발생:', error);
    throw createServiceError('AUTH_UNEXPECTED_ERROR', '로그인 중 예기치 않은 오류가 발생했습니다.', error);
  }
};

// 로그아웃
export const signOut = async () => {
  if (!supabase) {
    throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
  }
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('로그아웃 중 오류 발생:', error);
      throw createServiceError('AUTH_SIGNOUT_ERROR', '로그아웃 중 오류가 발생했습니다.', error);
    }
    return true;
  } catch (error) {
    console.error('로그아웃 중 예외 발생:', error);
    throw createServiceError('AUTH_UNEXPECTED_ERROR', '로그아웃 중 예기치 않은 오류가 발생했습니다.', error);
  }
};

// 서비스 오류 생성 유틸리티 함수
function createServiceError(code: string, message: string, details?: unknown): ServiceError {
  return { code, message, details };
} 