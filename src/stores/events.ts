import { writable } from 'svelte/store';
import { supabase } from '../services/supabase';

// 이벤트 인터페이스
export interface Event {
  id: string;
  title: string;
  description?: string;
  organizer?: string;
  category?: string;
  reservationStart: Date | string;
  reservationPlatform?: string;
  reservationLink?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  hasNotification?: boolean; // 알림 설정 여부 (클라이언트 측 상태)
}

// 이벤트 상태 인터페이스
export interface EventsState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  filter: {
    category?: string;
    organizer?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    searchQuery?: string;
  };
}

// 초기 이벤트 상태
const initialState: EventsState = {
  events: [],
  isLoading: false,
  error: null,
  filter: {}
};

// 이벤트 스토어 생성
function createEventsStore() {
  const { subscribe, set, update } = writable<EventsState>(initialState);

  // 이벤트 목록 가져오기
  const fetchEvents = async () => {
    try {
      update(state => ({ ...state, isLoading: true, error: null }));

      // 아직 Supabase 테이블이 없으므로 샘플 데이터를 사용합니다.
      // 실제 구현에서는 아래 주석 처리된 코드를 사용합니다.
      /*
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('reservation_start', { ascending: true });

      if (error) {
        throw error;
      }

      // 데이터 변환 (스네이크 케이스 -> 카멜 케이스)
      const events = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        organizer: item.organizer,
        category: item.category,
        reservationStart: new Date(item.reservation_start),
        reservationPlatform: item.reservation_platform,
        reservationLink: item.reservation_link,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        hasNotification: false // 알림 설정은 별도로 확인해야 함
      }));
      */

      // 샘플 데이터
      const sampleEvents: Event[] = [
        {
          id: '1',
          title: '샘플 콘서트 예약',
          description: '인기 아티스트의 콘서트 예약을 놓치지 마세요. 선착순 한정 입장권!',
          reservationStart: new Date(Date.now() + 86400000), // 내일
          reservationPlatform: '인터파크',
          reservationLink: 'https://example.com',
          category: '콘서트',
          organizer: '뮤직 엔터테인먼트',
          hasNotification: true
        },
        {
          id: '2',
          title: '인기 전시회 티켓 오픈',
          description: '한정 특별 전시회 티켓 예약이 곧 시작됩니다.',
          reservationStart: new Date(Date.now() + 86400000 * 3), // 3일 후
          reservationPlatform: '네이버',
          reservationLink: 'https://example.com',
          category: '전시회',
          organizer: '아트 재단',
          hasNotification: false
        },
        {
          id: '3',
          title: '한정판 굿즈 예약',
          description: '인기 아이돌 콘서트 한정판 굿즈 예약이 시작됩니다.',
          reservationStart: new Date(Date.now() + 86400000 * 2), // 2일 후
          reservationPlatform: '카카오',
          reservationLink: 'https://example.com',
          category: '굿즈',
          organizer: '엔터테인먼트 샵',
          hasNotification: false
        }
      ];

      // 데이터 설정
      update(state => ({
        ...state,
        events: sampleEvents,
        isLoading: false
      }));
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : '이벤트를 불러오는 중 오류가 발생했습니다'
      }));
    }
  };

  // 이벤트 추가
  const addEvent = async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      update(state => ({ ...state, isLoading: true, error: null }));

      // Supabase 연동시 사용할 코드
      /*
      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            title: event.title,
            description: event.description,
            organizer: event.organizer,
            category: event.category,
            reservation_start: event.reservationStart,
            reservation_platform: event.reservationPlatform,
            reservation_link: event.reservationLink
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      const newEvent = {
        id: data[0].id,
        title: data[0].title,
        description: data[0].description,
        organizer: data[0].organizer,
        category: data[0].category,
        reservationStart: new Date(data[0].reservation_start),
        reservationPlatform: data[0].reservation_platform,
        reservationLink: data[0].reservation_link,
        createdAt: new Date(data[0].created_at),
        updatedAt: new Date(data[0].updated_at),
        hasNotification: false
      };
      */

      // 임시 구현 (실제로는 서버에서 ID를 생성)
      const newEvent: Event = {
        id: Math.random().toString(36).substr(2, 9), // 임의의 ID 생성
        ...event,
        createdAt: new Date(),
        updatedAt: new Date(),
        hasNotification: false
      };

      update(state => ({
        ...state,
        events: [...state.events, newEvent],
        isLoading: false
      }));

      return newEvent;
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : '이벤트를 추가하는 중 오류가 발생했습니다'
      }));
      throw error;
    }
  };

  // 이벤트 수정
  const updateEvent = async (id: string, eventData: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      update(state => ({ ...state, isLoading: true, error: null }));

      // Supabase 연동시 사용할 코드
      /*
      const { error } = await supabase
        .from('events')
        .update({
          title: eventData.title,
          description: eventData.description,
          organizer: eventData.organizer,
          category: eventData.category,
          reservation_start: eventData.reservationStart,
          reservation_platform: eventData.reservationPlatform,
          reservation_link: eventData.reservationLink
        })
        .eq('id', id);

      if (error) {
        throw error;
      }
      */

      // 임시 구현
      update(state => {
        const events = state.events.map(event => {
          if (event.id === id) {
            return {
              ...event,
              ...eventData,
              updatedAt: new Date()
            };
          }
          return event;
        });

        return {
          ...state,
          events,
          isLoading: false
        };
      });
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : '이벤트를 수정하는 중 오류가 발생했습니다'
      }));
      throw error;
    }
  };

  // 이벤트 삭제
  const deleteEvent = async (id: string) => {
    try {
      update(state => ({ ...state, isLoading: true, error: null }));

      // Supabase 연동시 사용할 코드
      /*
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      */

      // 임시 구현
      update(state => ({
        ...state,
        events: state.events.filter(event => event.id !== id),
        isLoading: false
      }));
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : '이벤트를 삭제하는 중 오류가 발생했습니다'
      }));
      throw error;
    }
  };

  // 필터 설정
  const setFilter = (filter: EventsState['filter']) => {
    update(state => ({
      ...state,
      filter: {
        ...state.filter,
        ...filter
      }
    }));
  };

  // 알림 토글
  const toggleNotification = (id: string) => {
    update(state => {
      const events = state.events.map(event => {
        if (event.id === id) {
          return {
            ...event,
            hasNotification: !event.hasNotification
          };
        }
        return event;
      });

      return {
        ...state,
        events
      };
    });

    // 실제 구현에서는 여기서 알림 설정 변경 API를 호출합니다.
  };

  // 초기 데이터 로드
  fetchEvents();

  return {
    subscribe,
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    setFilter,
    toggleNotification
  };
}

// 이벤트 스토어 내보내기
export const eventsStore = createEventsStore(); 