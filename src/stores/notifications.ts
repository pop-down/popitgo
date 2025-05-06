import { writable, get as getStore } from 'svelte/store';
import { supabase } from '@services/supabase';
import { notificationService } from '@services/supabase';

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

// 서비스에서 반환되는 알림 인터페이스
interface ServiceNotification {
  id: number;
  userId: string;
  eventId: number;
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
  const fetchNotifications = async () => {
    try {
      const notifications = await notificationService.list();
      update(state => ({
        ...state,
        notifications: notifications.map((n: ServiceNotification) => ({
          id: n.id.toString(),
          userId: n.userId,
          eventId: n.eventId.toString(),
          type: n.type,
          minutesBefore: n.minutesBefore,
          isActive: n.isActive,
          createdAt: n.createdAt,
          updatedAt: n.updatedAt
        })),
        isLoading: false
      }));
    } catch (error) {
      console.error('알림 목록을 가져오는 중 오류 발생:', error);
      update(state => ({
        ...state,
        error: '알림 목록을 가져오는데 실패했습니다.',
        isLoading: false
      }));
    }
  };

  // 알림 추가
  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await notificationService.create({
        eventId: parseInt(notification.eventId),
        type: notification.type,
        minutesBefore: notification.minutesBefore
      });
      
      update(state => ({
        ...state,
        notifications: [...state.notifications, {
          ...notification,
          id: result.toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        }]
      }));
    } catch (error) {
      console.error('알림 추가 중 오류 발생:', error);
      throw error;
    }
  };

  // 알림 수정
  const updateNotification = async (id: string, notification: Partial<Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      await notificationService.update(parseInt(id), {
        type: notification.type,
        minutesBefore: notification.minutesBefore
      });
      
      update(state => ({
        ...state,
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, ...notification, updatedAt: new Date() } : n
        )
      }));
    } catch (error) {
      console.error('알림 수정 중 오류 발생:', error);
      throw error;
    }
  };

  // 알림 삭제
  const deleteNotification = async (id: string) => {
    try {
      await notificationService.delete(parseInt(id));
      
      update(state => ({
        ...state,
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    } catch (error) {
      console.error('알림 삭제 중 오류 발생:', error);
      throw error;
    }
  };

  // 알림 상태 토글
  const toggleNotificationStatus = async (id: string) => {
    try {
      const notification = getStore(store).notifications.find(n => n.id === id);
      if (!notification) throw new Error('알림을 찾을 수 없습니다.');
      
      await notificationService.update(parseInt(id), {
        isActive: !notification.isActive
      });
      
      update(state => ({
        ...state,
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, isActive: !n.isActive, updatedAt: new Date() } : n
        )
      }));
    } catch (error) {
      console.error('알림 상태 변경 중 오류 발생:', error);
      throw error;
    }
  };

  // 이벤트별 알림 가져오기
  const getNotificationsByEventId = async (eventId: string) => {
    try {
      const notifications = await notificationService.listByEvent(parseInt(eventId));
      return notifications.map((n: ServiceNotification) => ({
        id: n.id.toString(),
        userId: n.userId,
        eventId: n.eventId.toString(),
        type: n.type,
        minutesBefore: n.minutesBefore,
        isActive: n.isActive,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt
      }));
    } catch (error) {
      console.error('이벤트별 알림을 가져오는 중 오류 발생:', error);
      throw error;
    }
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