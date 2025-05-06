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

// 이벤트 관련 RPC 함수
export const eventService = {
  create: async (event: {
    title: string;
    description?: string;
    organizer?: string;
    category?: string;
    reservationStart: Date;
    reservationEnd: Date;
    reservationPlatform?: string;
    reservationLink?: string;
  }) => {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    const { data, error } = await supabase.rpc('create_event', {
      p_title: event.title,
      p_description: event.description,
      p_organizer: event.organizer,
      p_category: event.category,
      p_reservation_start: event.reservationStart,
      p_reservation_end: event.reservationEnd,
      p_reservation_platform: event.reservationPlatform,
      p_reservation_link: event.reservationLink
    });
    if (error) throw error;
    return data;
  },

  update: async (id: number, event: {
    title?: string;
    description?: string;
    organizer?: string;
    category?: string;
    reservationStart?: Date;
    reservationEnd?: Date;
    reservationPlatform?: string;
    reservationLink?: string;
  }) => {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    const { data, error } = await supabase.rpc('update_event', {
      p_id: id,
      p_title: event.title,
      p_description: event.description,
      p_organizer: event.organizer,
      p_category: event.category,
      p_reservation_start: event.reservationStart,
      p_reservation_end: event.reservationEnd,
      p_reservation_platform: event.reservationPlatform,
      p_reservation_link: event.reservationLink
    });
    if (error) throw error;
    return data;
  },

  delete: async (id: number) => {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    const { data, error } = await supabase.rpc('delete_event', { p_id: id });
    if (error) throw error;
    return data;
  },

  get: async (id: number) => {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    const { data, error } = await supabase.rpc('get_event', { p_id: id });
    if (error) throw error;
    return transformers.fromSupabase.event(data);
  },

  list: async (params?: { category?: string; startDate?: Date; endDate?: Date }) => {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    const { data, error } = await supabase.rpc('list_events', {
      p_category: params?.category,
      p_start_date: params?.startDate,
      p_end_date: params?.endDate
    });
    if (error) throw error;
    return data.map(transformers.fromSupabase.event);
  },

  createNotification: async (notification: {
    eventId: number;
    type: string;
    minutesBefore: number;
  }) => {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    const { data, error } = await supabase.rpc('create_notification', {
      p_event_id: notification.eventId,
      p_type: notification.type,
      p_minutes_before: notification.minutesBefore
    });
    if (error) throw error;
    return data;
  },

  deleteNotification: async (eventId: number) => {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    const { data, error } = await supabase.rpc('delete_notification', { p_event_id: eventId });
    if (error) throw error;
    return data;
  },

  createNote: async (note: {
    eventId: number;
    content: string;
  }) => {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    const { data, error } = await supabase.rpc('create_note', {
      p_event_id: note.eventId,
      p_content: note.content
    });
    if (error) throw error;
    return data;
  },

  getNote: async (eventId: number) => {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    const { data, error } = await supabase.rpc('get_note', { p_event_id: eventId });
    if (error) throw error;
    return transformers.fromSupabase.note(data);
  }
};

// 서버 데이터를 클라이언트 형식으로 변환
const transformFromServer = (data: any) => {
  if (!data) return null;
  
  return {
    id: data.id,
    userId: data.user_id,
    eventId: data.event_id,
    type: data.type,
    minutesBefore: data.minutes_before,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

// 알림 서비스
export const notificationService = {
  async create(data: { eventId: number; type: 'push' | 'email' | 'both'; minutesBefore: number }) {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { data: result, error } = await supabase.rpc('create_notification', {
      p_event_id: data.eventId,
      p_type: data.type,
      p_minutes_before: data.minutesBefore
    });

    if (error) throw error;
    return result;
  },

  async update(id: number, data: { type?: 'push' | 'email' | 'both'; minutesBefore?: number; isActive?: boolean }) {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { error } = await supabase.rpc('update_notification', {
      p_id: id,
      p_type: data.type,
      p_minutes_before: data.minutesBefore,
      p_is_active: data.isActive
    });

    if (error) throw error;
    return true;
  },

  async delete(id: number) {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { error } = await supabase.rpc('delete_notification', {
      p_id: id
    });

    if (error) throw error;
    return true;
  },

  async get(id: number) {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { data, error } = await supabase.rpc('get_notification', {
      p_id: id
    });

    if (error) throw error;
    return transformFromServer(data);
  },

  async list() {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { data, error } = await supabase.rpc('list_notifications');

    if (error) throw error;
    return data.map(transformFromServer);
  },

  async listByEvent(eventId: number) {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { data, error } = await supabase.rpc('list_notifications', {
      p_event_id: eventId
    });

    if (error) throw error;
    return data.map(transformFromServer);
  }
};

// 노트 서비스
export const noteService = {
  async create(data: { eventId: number; content: string }) {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { data: result, error } = await supabase.rpc('create_note', {
      p_event_id: data.eventId,
      p_content: data.content
    });

    if (error) throw error;
    return result;
  },

  async update(id: number, data: { content: string }) {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { error } = await supabase.rpc('update_note', {
      p_id: id,
      p_content: data.content
    });

    if (error) throw error;
    return true;
  },

  async delete(id: number) {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { error } = await supabase.rpc('delete_note', {
      p_id: id
    });

    if (error) throw error;
    return true;
  },

  async get(id: number) {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { data, error } = await supabase.rpc('get_note', {
      p_id: id
    });

    if (error) throw error;
    return transformers.fromSupabase.note(data);
  },

  async list() {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { data, error } = await supabase.rpc('list_notes');

    if (error) throw error;
    return data.map(transformers.fromSupabase.note);
  },

  async listByEvent(eventId: number) {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { data, error } = await supabase.rpc('list_notes', {
      p_event_id: eventId
    });

    if (error) throw error;
    return data.map(transformers.fromSupabase.note);
  }
};

// 방문 예약 서비스
export const visitReservationService = {
  async create(data: {
    boothActivityId: number;
    visitorName: string;
    visitorPhone: string;
    visitorEmail: string;
    visitDatetime: Date;
    reservationPlatform?: string;
    reservationUrl?: string;
    notes?: string;
  }) {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { data: result, error } = await supabase.rpc('create_resv_visit', {
      p_booth_activity_id: data.boothActivityId,
      p_visitor_name: data.visitorName,
      p_visitor_phone: data.visitorPhone,
      p_visitor_email: data.visitorEmail,
      p_visit_datetime: data.visitDatetime,
      p_reservation_platform: data.reservationPlatform,
      p_reservation_url: data.reservationUrl,
      p_notes: data.notes
    });

    if (error) throw error;
    return result;
  },

  async update(id: number, data: {
    visitorName?: string;
    visitorPhone?: string;
    visitorEmail?: string;
    visitDatetime?: Date;
    reservationPlatform?: string;
    reservationUrl?: string;
    notes?: string;
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  }) {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { error } = await supabase.rpc('update_resv_visit', {
      p_id: id,
      p_visitor_name: data.visitorName,
      p_visitor_phone: data.visitorPhone,
      p_visitor_email: data.visitorEmail,
      p_visit_datetime: data.visitDatetime,
      p_reservation_platform: data.reservationPlatform,
      p_reservation_url: data.reservationUrl,
      p_notes: data.notes,
      p_status: data.status
    });

    if (error) throw error;
    return true;
  },

  async delete(id: number) {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { error } = await supabase.rpc('delete_resv_visit', {
      p_id: id
    });

    if (error) throw error;
    return true;
  },

  async get(id: number) {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { data, error } = await supabase.rpc('get_resv_visits', {
      p_id: id
    });

    if (error) throw error;
    return transformFromServer(data);
  },

  async list(params?: {
    boothActivityId?: number;
    startDate?: Date;
    endDate?: Date;
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  }) {
    if (!supabase) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
    
    const { data, error } = await supabase.rpc('list_resv_visits', {
      p_booth_activity_id: params?.boothActivityId,
      p_start_date: params?.startDate,
      p_end_date: params?.endDate,
      p_status: params?.status
    });

    if (error) throw error;
    return data.map(transformFromServer);
  }
}; 