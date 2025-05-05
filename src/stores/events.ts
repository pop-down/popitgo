import { writable } from 'svelte/store';
import { supabase, transformers } from '../services/supabase';

// 이벤트 인터페이스
export interface Event {
  id: string;
  title: string;
  description?: string;
  organizer?: string;
  category?: string;
  reservationStart: string | Date;
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

  // 이벤트 목록 가져오기
  const fetchEvents = async () => {
    update(state => ({ ...state, isLoading: true, error: null }));

    try {
      // 모든 이벤트 데이터 가져오기
      const { data: eventsData, error: eventsError } = await supabase
        .from('resv_events')
        .select('*')
        .order('reservation_start', { ascending: true });

      if (eventsError) throw eventsError;

      if (!eventsData || eventsData.length === 0) {
        update(state => ({
          ...state,
          events: [],
          isLoading: false
        }));
        return;
      }

      // 데이터 변환 (스네이크 케이스 -> 카멜 케이스)
      const events = eventsData.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        organizer: item.organizer,
        category: item.category,
        reservationStart: item.reservation_start,
        reservationPlatform: item.reservation_platform,
        reservationLink: item.reservation_link,
        hasNotification: false, // 기본값 설정
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      // 로그인한 사용자 정보 확인
      const user = await supabase.auth.getUser();
      
      // 로그인한 사용자가 있는 경우 알림 정보 가져오기
      if (user.data?.user) {
        try {
          const { data: notifications, error: notificationError } = await supabase
            .from('resv_notifications')
            .select('event_id')
            .eq('user_id', user.data.user.id);
          
          if (!notificationError && notifications && notifications.length > 0) {
            const eventIdsWithNotifications = new Set(notifications.map(n => n.event_id));
            console.log('사용자의 알림이 설정된 이벤트 목록:', Array.from(eventIdsWithNotifications));
            events.forEach(event => {
              event.hasNotification = eventIdsWithNotifications.has(event.id);
              if (event.hasNotification) {
                console.log(`이벤트 '${event.title}'에 알림이 설정됨`);
              }
            });
          } else {
            console.log('알림 정보가 없거나 가져오는 중 오류가 발생했습니다:', notificationError);
          }
        } catch (error) {
          console.error('알림 정보 가져오기 오류:', error);
        }
      }

      update(state => ({
        ...state,
        events,
        isLoading: false
      }));
    } catch (error) {
      console.error('이벤트 목록 가져오기 오류:', error);
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : '이벤트를 불러오는 중 오류가 발생했습니다'
      }));
    }
  };

  // 이벤트 추가
  const addEvent = async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    update(state => ({ ...state, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('resv_events')
        .insert([{
          title: event.title,
          description: event.description,
          organizer: event.organizer,
          category: event.category,
          reservation_start: event.reservationStart,
          reservation_platform: event.reservationPlatform,
          reservation_link: event.reservationLink
        }])
        .select()
        .single();

      if (error) throw error;

      const newEvent: Event = {
        id: data.id,
        title: data.title,
        description: data.description,
        organizer: data.organizer,
        category: data.category,
        reservationStart: data.reservation_start,
        reservationPlatform: data.reservation_platform,
        reservationLink: data.reservation_link,
        hasNotification: false,
        createdAt: data.created_at,
        updatedAt: data.updated_at
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
    update(state => ({ ...state, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('resv_events')
        .update({
          title: eventData.title,
          description: eventData.description,
          organizer: eventData.organizer,
          category: eventData.category,
          reservation_start: eventData.reservationStart,
          reservation_platform: eventData.reservationPlatform,
          reservation_link: eventData.reservationLink
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // 현재 이벤트의 알림 상태 유지
      const currentEvent = await getEventById(id);
      const hasNotification = currentEvent?.hasNotification || false;

      const updatedEvent: Event = {
        id: data.id,
        title: data.title,
        description: data.description,
        organizer: data.organizer,
        category: data.category,
        reservationStart: data.reservation_start,
        reservationPlatform: data.reservation_platform,
        reservationLink: data.reservation_link,
        hasNotification,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      update(state => ({
        ...state,
        events: state.events.map(event => event.id === id ? updatedEvent : event),
        isLoading: false
      }));

      return updatedEvent;
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
    update(state => ({ ...state, isLoading: true, error: null }));

    try {
      const { error } = await supabase
        .from('resv_events')
        .delete()
        .eq('id', id);

      if (error) throw error;

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
  const toggleNotification = async (id: string) => {
    update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
      // 현재 이벤트의 알림 상태 확인
      const currentState = await new Promise<EventsState>((resolve) => {
        const unsubscribe = subscribe((state) => {
          resolve(state);
          unsubscribe();
        });
      });
      
      const currentEvent = currentState.events.find(event => event.id === id);
      
      if (!currentEvent) throw new Error('이벤트를 찾을 수 없습니다.');
      
      if (currentEvent.hasNotification) {
        // 알림 삭제
        const { error } = await supabase
          .from('resv_notifications')
          .delete()
          .eq('event_id', id);
        
        if (error) throw error;
      } else {
        // 알림 추가
        const { error } = await supabase
          .from('resv_notifications')
          .insert([{
            event_id: id,
            type: 'reservation_start',
            minutes_before: 30
          }]);
        
        if (error) throw error;
      }
      
      // 상태 업데이트
      update(state => ({
        ...state,
        events: state.events.map(event => 
          event.id === id 
            ? { ...event, hasNotification: !event.hasNotification } 
            : event
        ),
        isLoading: false
      }));
    } catch (err) {
      console.error('알림 설정 오류:', err);
      update(state => ({ 
        ...state, 
        isLoading: false, 
        error: err instanceof Error ? err.message : '알림 설정을 변경하는 데 실패했습니다.' 
      }));
      throw err;
    }
  };
  
  // 이벤트 상세 정보 가져오기
  const getEventById = async (id: string): Promise<Event | null> => {
    try {
      const { data, error } = await supabase
        .from('resv_events')
        .select('*, resv_notifications(id)')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        return null;
      }

      const event: Event = {
        id: data.id,
        title: data.title,
        description: data.description,
        organizer: data.organizer,
        category: data.category,
        reservationStart: data.reservation_start,
        reservationPlatform: data.reservation_platform,
        reservationLink: data.reservation_link,
        hasNotification: data.notifications && data.notifications.length > 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      // 알림 설정 여부 확인
      const user = await supabase.auth.getUser();
      if (user.data?.user) {
        const { data: notificationData } = await supabase
          .from('resv_notifications')
          .select('*')
          .eq('event_id', id)
          .eq('user_id', user.data.user.id)
          .single();
          
        event.hasNotification = !!notificationData;
      }
      
      return event;
    } catch (error) {
      console.error('이벤트 상세 정보를 가져오는 중 오류 발생:', error);
      throw error;
    }
  };
  
  // 알림 설정
  const setNotification = async (eventId: string, minutesBefore: number): Promise<void> => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data?.user) {
        throw new Error('로그인이 필요합니다.');
      }
      
      const notification = {
        userId: user.data.user.id,
        eventId,
        type: 'reservation_start',
        minutesBefore
      };
      
      const { error } = await supabase
        .from('resv_notifications')
        .upsert([transformers.toSupabase.notification(notification)]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('알림 설정 중 오류 발생:', error);
      throw error;
    }
  };
  
  // 알림 해제
  const removeNotification = async (eventId: string): Promise<void> => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data?.user) {
        throw new Error('로그인이 필요합니다.');
      }
      
      const { error } = await supabase
        .from('resv_notifications')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.data.user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('알림 해제 중 오류 발생:', error);
      throw error;
    }
  };
  
  // 메모 가져오기
  const getNoteForEvent = async (eventId: string): Promise<Note | null> => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data?.user) {
        throw new Error('로그인이 필요합니다.');
      }
      
      const { data, error } = await supabase
        .from('resv_notes')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.data.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // 데이터가 없는 경우
          return null;
        }
        throw error;
      }

      const transformedNote = transformers.fromSupabase.note(data);
      
      // null 값 처리
      if (transformedNote.createdAt === null) {
        transformedNote.createdAt = new Date();
      }
      
      if (transformedNote.updatedAt === null) {
        transformedNote.updatedAt = new Date();
      }
      
      return transformedNote as Note;
    } catch (error) {
      console.error('메모를 가져오는 중 오류 발생:', error);
      return null;
    }
  };
  
  // 메모 저장
  const saveNoteForEvent = async (eventId: string, content: string): Promise<void> => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data?.user) {
        throw new Error('로그인이 필요합니다.');
      }
      
      const note = {
        userId: user.data.user.id,
        eventId,
        content
      };
      
      const { error } = await supabase
        .from('resv_notes')
        .upsert([transformers.toSupabase.note(note)]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('메모 저장 중 오류 발생:', error);
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