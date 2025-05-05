import { writable, get as getStore } from 'svelte/store';
import { supabase } from '../services/supabase';

// 알림 인터페이스
export interface Notification {
  id: string;
  userId: string;
  eventId: string;
  type: 'push' | 'email' | 'both';
  minutesBefore: number;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// 알림 상태 인터페이스
export interface NotificationsState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
}

// 초기 알림 상태
const initialState: NotificationsState = {
  notifications: [],
  isLoading: false,
  error: null
};

// 알림 스토어 생성
function createNotificationsStore() {
  const store = writable<NotificationsState>(initialState);
  const { subscribe, set, update } = store;

  // 알림 목록 가져오기
  const fetchNotifications = async (userId: string) => {
    try {
      update(state => ({ ...state, isLoading: true, error: null }));

      // 실제 구현에서는 아래 주석 처리된 코드를 사용합니다.
      /*
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // 데이터 변환 (스네이크 케이스 -> 카멜 케이스)
      const notifications = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        eventId: item.event_id,
        type: item.type,
        minutesBefore: item.minutes_before,
        isActive: item.is_active,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
      */

      // 샘플 데이터
      const sampleNotifications: Notification[] = [
        {
          id: '1',
          userId,
          eventId: '1',
          type: 'push',
          minutesBefore: 60,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          userId,
          eventId: '2',
          type: 'email',
          minutesBefore: 1440, // 24시간
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // 데이터 설정
      update(state => ({
        ...state,
        notifications: sampleNotifications,
        isLoading: false
      }));
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : '알림을 불러오는 중 오류가 발생했습니다'
      }));
    }
  };

  // 알림 추가
  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      update(state => ({ ...state, isLoading: true, error: null }));

      // Supabase 연동시 사용할 코드
      /*
      const { data, error } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: notification.userId,
            event_id: notification.eventId,
            type: notification.type,
            minutes_before: notification.minutesBefore,
            is_active: notification.isActive
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      const newNotification = {
        id: data[0].id,
        userId: data[0].user_id,
        eventId: data[0].event_id,
        type: data[0].type,
        minutesBefore: data[0].minutes_before,
        isActive: data[0].is_active,
        createdAt: new Date(data[0].created_at),
        updatedAt: new Date(data[0].updated_at)
      };
      */

      // 임시 구현 (실제로는 서버에서 ID를 생성)
      const newNotification: Notification = {
        id: Math.random().toString(36).substr(2, 9), // 임의의 ID 생성
        ...notification,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      update(state => ({
        ...state,
        notifications: [...state.notifications, newNotification],
        isLoading: false
      }));

      return newNotification;
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : '알림을 추가하는 중 오류가 발생했습니다'
      }));
      throw error;
    }
  };

  // 알림 수정
  const updateNotification = async (id: string, notificationData: Partial<Omit<Notification, 'id' | 'userId' | 'eventId' | 'createdAt' | 'updatedAt'>>) => {
    try {
      update(state => ({ ...state, isLoading: true, error: null }));

      // Supabase 연동시 사용할 코드
      /*
      const { error } = await supabase
        .from('notifications')
        .update({
          type: notificationData.type,
          minutes_before: notificationData.minutesBefore,
          is_active: notificationData.isActive
        })
        .eq('id', id);

      if (error) {
        throw error;
      }
      */

      // 임시 구현
      update(state => {
        const notifications = state.notifications.map(notification => {
          if (notification.id === id) {
            return {
              ...notification,
              ...notificationData,
              updatedAt: new Date()
            };
          }
          return notification;
        });

        return {
          ...state,
          notifications,
          isLoading: false
        };
      });
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : '알림을 수정하는 중 오류가 발생했습니다'
      }));
      throw error;
    }
  };

  // 알림 삭제
  const deleteNotification = async (id: string) => {
    try {
      update(state => ({ ...state, isLoading: true, error: null }));

      // Supabase 연동시 사용할 코드
      /*
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      */

      // 임시 구현
      update(state => ({
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== id),
        isLoading: false
      }));
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : '알림을 삭제하는 중 오류가 발생했습니다'
      }));
      throw error;
    }
  };

  // 알림 활성화/비활성화 토글
  const toggleNotificationStatus = async (id: string) => {
    try {
      update(state => ({ ...state, isLoading: true, error: null }));

      // 현재 알림 상태 확인
      const currentState = getStore(store);
      const notification = currentState.notifications.find((n: Notification) => n.id === id);
      
      if (!notification) {
        throw new Error('알림을 찾을 수 없습니다');
      }

      // 상태 업데이트
      await updateNotification(id, { isActive: !notification.isActive });
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : '알림 상태를 변경하는 중 오류가 발생했습니다'
      }));
      throw error;
    }
  };

  // 이벤트 ID로 알림 찾기
  const getNotificationsByEventId = (eventId: string) => {
    const currentState = getStore(store);
    return currentState.notifications.filter(notification => notification.eventId === eventId);
  };

  return {
    subscribe,
    fetchNotifications,
    addNotification,
    updateNotification,
    deleteNotification,
    toggleNotificationStatus,
    getNotificationsByEventId
  };
}

// 알림 스토어 내보내기
export const notificationsStore = createNotificationsStore(); 