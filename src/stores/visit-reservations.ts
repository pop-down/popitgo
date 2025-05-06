import { writable } from 'svelte/store';
import { visitReservationService } from '@services/supabase';

// 방문 예약 인터페이스
export interface VisitReservation {
  id: number;
  boothActivityId: number;
  visitorName: string;
  visitorPhone: string;
  visitorEmail: string;
  visitDatetime: Date;
  reservationPlatform?: string;
  reservationUrl?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// 방문 예약 상태 인터페이스
export interface VisitReservationsState {
  reservations: VisitReservation[];
  isLoading: boolean;
  error: string | null;
}

// 초기 상태
const initialState: VisitReservationsState = {
  reservations: [],
  isLoading: false,
  error: null
};

// 방문 예약 스토어 생성
function createVisitReservationsStore() {
  const store = writable<VisitReservationsState>(initialState);
  const { subscribe, set, update } = store;

  // 방문 예약 목록 가져오기
  const fetchReservations = async (params?: {
    boothActivityId?: number;
    startDate?: Date;
    endDate?: Date;
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  }) => {
    try {
      update(state => ({ ...state, isLoading: true }));
      const reservations = await visitReservationService.list(params);
      update(state => ({
        ...state,
        reservations,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      console.error('방문 예약 목록을 가져오는 중 오류 발생:', error);
      update(state => ({
        ...state,
        isLoading: false,
        error: '방문 예약 목록을 가져오는데 실패했습니다.'
      }));
    }
  };

  // 방문 예약 추가
  const addReservation = async (data: Omit<VisitReservation, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await visitReservationService.create(data);
      const newReservation = (await visitReservationService.get(result) as unknown) as VisitReservation;
      
      if (!newReservation) {
        throw new Error('방문 예약을 가져오는데 실패했습니다.');
      }

      update(state => ({
        ...state,
        reservations: [...state.reservations, newReservation]
      }));
      return newReservation;
    } catch (error) {
      console.error('방문 예약 추가 중 오류 발생:', error);
      throw error;
    }
  };

  // 방문 예약 수정
  const updateReservation = async (id: number, data: Partial<Omit<VisitReservation, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      await visitReservationService.update(id, data);
      const updatedReservation = (await visitReservationService.get(id) as unknown) as VisitReservation;
      
      if (!updatedReservation) {
        throw new Error('방문 예약을 가져오는데 실패했습니다.');
      }

      update(state => ({
        ...state,
        reservations: state.reservations.map(reservation =>
          reservation.id === id ? updatedReservation : reservation
        )
      }));
      return updatedReservation;
    } catch (error) {
      console.error('방문 예약 수정 중 오류 발생:', error);
      throw error;
    }
  };

  // 방문 예약 삭제
  const deleteReservation = async (id: number) => {
    try {
      await visitReservationService.delete(id);
      update(state => ({
        ...state,
        reservations: state.reservations.filter(reservation => reservation.id !== id)
      }));
    } catch (error) {
      console.error('방문 예약 삭제 중 오류 발생:', error);
      throw error;
    }
  };

  // 방문 예약 상태 변경
  const updateReservationStatus = async (id: number, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    return updateReservation(id, { status });
  };

  return {
    subscribe,
    fetchReservations,
    addReservation,
    updateReservation,
    deleteReservation,
    updateReservationStatus
  };
}

// 방문 예약 스토어 내보내기
export const visitReservationsStore = createVisitReservationsStore(); 