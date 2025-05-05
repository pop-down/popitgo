/**
 * 애플리케이션에서 사용하는 상수값들을 정의합니다.
 */

// 앱 정보
export const APP_NAME = 'PopItGo';
export const APP_DESCRIPTION = '이벤트 예약 및 관리를 위한 PWA 애플리케이션';
export const APP_VERSION = '0.1.0.0';

// 이벤트 카테고리
export const EVENT_CATEGORIES = [
  { value: 'concert', label: '콘서트' },
  { value: 'exhibition', label: '전시회' },
  { value: 'festival', label: '페스티벌' },
  { value: 'performance', label: '공연' },
  { value: 'sports', label: '스포츠' },
  { value: 'goods', label: '굿즈' },
  { value: 'fanmeeting', label: '팬미팅' },
  { value: 'other', label: '기타' },
];

// 알림 시간 옵션 (분 단위)
export const NOTIFICATION_TIMES = [
  { value: 5, label: '5분 전' },
  { value: 15, label: '15분 전' },
  { value: 30, label: '30분 전' },
  { value: 60, label: '1시간 전' },
  { value: 180, label: '3시간 전' },
  { value: 360, label: '6시간 전' },
  { value: 720, label: '12시간 전' },
  { value: 1440, label: '1일 전' },
  { value: 2880, label: '2일 전' },
  { value: 10080, label: '1주일 전' },
];

// 예약 플랫폼 옵션
export const RESERVATION_PLATFORMS = [
  { value: 'interpark', label: '인터파크' },
  { value: 'melon', label: '멜론티켓' },
  { value: 'yes24', label: '예스24' },
  { value: 'ticketlink', label: '티켓링크' },
  { value: 'naver', label: '네이버' },
  { value: 'kakao', label: '카카오' },
  { value: 'tmon', label: '티몬' },
  { value: 'coupang', label: '쿠팡' },
  { value: 'other', label: '기타' },
]; 