// import { supabase } from '../../../services/supabase';

import { supabase } from "@services/supabase";

export type NotificationType = 'reservation_created' | 'reservation_confirmed' | 'reservation_cancelled';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  created_at: string;
  read_at: string | null;
}

export async function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  data: Record<string, any>
): Promise<void> {
  const { error } = await supabase.rpc('create_notification', {
    p_type: type,
    p_title: title,
    p_message: message,
    p_data: data
  });

  if (error) throw error;
}

export async function getNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase.rpc('get_notifications');
  if (error) throw error;
  return data;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const { error } = await supabase.rpc('mark_notification_as_read', {
    p_notification_id: id
  });

  if (error) throw error;
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const { error } = await supabase.rpc('mark_all_notifications_as_read');
  if (error) throw error;
}

export async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabase.rpc('delete_notification', {
    p_notification_id: id
  });

  if (error) throw error;
}

export async function deleteAllNotifications(): Promise<void> {
  const { error } = await supabase.rpc('delete_all_notifications');
  if (error) throw error;
}

// 예약 관련 알림 생성 함수들
export async function createReservationCreatedNotification(reservation: any): Promise<void> {
  await createNotification(
    'reservation_created',
    '새로운 예약이 생성되었습니다',
    `${reservation.visitor_name}님이 ${reservation.activity_title}에 예약했습니다.`,
    { reservation_id: reservation.id }
  );
}

export async function createReservationConfirmedNotification(reservation: any): Promise<void> {
  await createNotification(
    'reservation_confirmed',
    '예약이 확정되었습니다',
    `${reservation.activity_title} 예약이 확정되었습니다.`,
    { reservation_id: reservation.id }
  );
}

export async function createReservationCancelledNotification(reservation: any): Promise<void> {
  await createNotification(
    'reservation_cancelled',
    '예약이 취소되었습니다',
    `${reservation.activity_title} 예약이 취소되었습니다.`,
    { reservation_id: reservation.id }
  );
} 