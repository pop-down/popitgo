import { writable } from 'svelte/store';
import { supabase, eventService, transformers } from '@services/supabase';

// 이벤트 인터페이스
export interface Event {
  id: string;
  title: string;
  description?: string;
  organizer?: string;
  category?: string;
  reservationStart: string | Date;
  reservationEnd: string | Date;
  reservationPlatform?: string;
  reservationLink?: string;
  hasNotification?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 메모 인터페이스
export interface Note {
  id: string;
  userId: string;
  eventId: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 알림 인터페이스
export interface Notification {
  id: string;
  userId: string;
  eventId: string;
  type: string;
  minutesBefore: number;
  createdAt: Date | string;
  updatedAt: Date | string;
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

  // 이벤트 목록 가져오기 (RPC)
  const fetchEvents = async () => {
    update(state => ({ ...state, isLoading: true, error: null }));
    try {
      const { data: eventsData, error: eventsError } = await supabase.rpc('list_events', {});
      if (eventsError) throw eventsError;
      if (!eventsData || eventsData.length === 0) {
        update(state => ({ ...state, events: [], isLoading: false }));
        return;
      }
      const events = eventsData.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        organizer: item.organizer,
        category: item.category,
        reservationStart: item.reservation_start,
        reservationEnd: item.reservation_end,
        reservationPlatform: item.reservation_platform,
        reservationLink: item.reservation_link,
        hasNotification: item.has_notification || false,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      update(state => ({ ...state, events, isLoading: false }));
    } catch (error) {
      update(state => ({ ...state, isLoading: false, error: error instanceof Error ? error.message : '이벤트를 불러오는 중 오류가 발생했습니다' }));
    }
  };

  // 이벤트 추가 (RPC)
  const addEvent = async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    update(state => ({ ...state, isLoading: true, error: null }));
    try {
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
      const newEvent: Event = {
        id: data.id,
        title: data.title,
        description: data.description,
        organizer: data.organizer,
        category: data.category,
        reservationStart: data.reservation_start,
        reservationEnd: data.reservation_end,
        reservationPlatform: data.reservation_platform,
        reservationLink: data.reservation_link,
        hasNotification: false,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      update(state => ({ ...state, events: [...state.events, newEvent], isLoading: false }));
      return newEvent;
    } catch (error) {
      update(state => ({ ...state, isLoading: false, error: error instanceof Error ? error.message : '이벤트를 추가하는 중 오류가 발생했습니다' }));
      throw error;
    }
  };

  // 이벤트 수정 (RPC)
  const updateEvent = async (id: string, eventData: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>) => {
    update(state => ({ ...state, isLoading: true, error: null }));
    try {
      const { data, error } = await supabase.rpc('update_event', {
        p_id: id,
        p_title: eventData.title,
        p_description: eventData.description,
        p_organizer: eventData.organizer,
        p_category: eventData.category,
        p_reservation_start: eventData.reservationStart,
        p_reservation_end: eventData.reservationEnd,
        p_reservation_platform: eventData.reservationPlatform,
        p_reservation_link: eventData.reservationLink
      });
      if (error) throw error;
      const updatedEvent: Event = {
        id: data.id,
        title: data.title,
        description: data.description,
        organizer: data.organizer,
        category: data.category,
        reservationStart: data.reservation_start,
        reservationEnd: data.reservation_end,
        reservationPlatform: data.reservation_platform,
        reservationLink: data.reservation_link,
        hasNotification: false,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      update(state => ({ ...state, events: state.events.map(event => event.id === id ? updatedEvent : event), isLoading: false }));
      return updatedEvent;
    } catch (error) {
      update(state => ({ ...state, isLoading: false, error: error instanceof Error ? error.message : '이벤트를 수정하는 중 오류가 발생했습니다' }));
      throw error;
    }
  };

  // 이벤트 삭제 (RPC)
  const deleteEvent = async (id: string) => {
    update(state => ({ ...state, isLoading: true, error: null }));
    try {
      const { error } = await supabase.rpc('delete_event', { p_id: id });
      if (error) throw error;
      update(state => ({ ...state, events: state.events.filter(event => event.id !== id), isLoading: false }));
    } catch (error) {
      update(state => ({ ...state, isLoading: false, error: error instanceof Error ? error.message : '이벤트를 삭제하는 중 오류가 발생했습니다' }));
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

  // 알림 토글 (RPC)
  const toggleNotification = async (id: string) => {
    update(state => ({ ...state, isLoading: true, error: null }));
    try {
      // 알림 상태 확인 (RPC)
      const { data: notificationData, error: notificationError } = await supabase.rpc('get_notification', { p_event_id: id });
      if (notificationError) throw notificationError;
      if (notificationData) {
        // 알림 삭제 (RPC)
        const { error } = await supabase.rpc('delete_notification', { p_event_id: id });
        if (error) throw error;
      } else {
        // 알림 추가 (RPC)
        const { error } = await supabase.rpc('create_notification', { p_event_id: id, p_type: 'reservation_start', p_minutes_before: 30 });
        if (error) throw error;
      }
      // 상태 업데이트 (다시 조회)
      await fetchEvents();
    } catch (err) {
      update(state => ({ ...state, isLoading: false, error: err instanceof Error ? err.message : '알림 설정을 변경하는 데 실패했습니다.' }));
      throw err;
    }
  };
  
  // 이벤트 상세 정보 가져오기 (RPC)
  const getEventById = async (id: string): Promise<Event | null> => {
    try {
      const { data, error } = await supabase.rpc('get_event', { p_id: id });
      if (error) throw error;
      if (!data) return null;
      const event: Event = {
        id: data.id,
        title: data.title,
        description: data.description,
        organizer: data.organizer,
        category: data.category,
        reservationStart: data.reservation_start,
        reservationEnd: data.reservation_end,
        reservationPlatform: data.reservation_platform,
        reservationLink: data.reservation_link,
        hasNotification: data.has_notification || false,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      return event;
    } catch (error) {
      throw error;
    }
  };
  
  // 알림 설정 (RPC)
  const setNotification = async (eventId: string, minutesBefore: number): Promise<void> => {
    try {
      await supabase.rpc('create_notification', { p_event_id: eventId, p_type: 'reservation_start', p_minutes_before: minutesBefore });
    } catch (error) {
      throw error;
    }
  };
  
  // 알림 해제 (RPC)
  const removeNotification = async (eventId: string): Promise<void> => {
    try {
      await supabase.rpc('delete_notification', { p_event_id: eventId });
    } catch (error) {
      throw error;
    }
  };
  
  // 메모 가져오기 (RPC)
  const getNoteForEvent = async (eventId: string): Promise<Note | null> => {
    try {
      const { data, error } = await supabase.rpc('get_note', { p_event_id: eventId });
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id.toString(),
        userId: data.user_id,
        eventId: data.event_id.toString(),
        content: data.content,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      return null;
    }
  };
  
  // 메모 저장 (RPC)
  const saveNoteForEvent = async (eventId: string, content: string): Promise<void> => {
    try {
      await supabase.rpc('create_note', { p_event_id: eventId, p_content: content });
    } catch (error) {
      throw error;
    }
  };

  return {
    subscribe,
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    setFilter,
    toggleNotification,
    getEventById,
    setNotification,
    removeNotification,
    getNoteForEvent,
    saveNoteForEvent
  };
}

// 이벤트 스토어 생성 및 내보내기
export const eventsStore = createEventsStore(); 