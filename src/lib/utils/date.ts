/**
 * 날짜를 'YYYY-MM-DD' 형식으로 포맷팅
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 시간을 'HH:MM' 형식으로 포맷팅
 */
export function formatTime(date: Date | string | number): string {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

/**
 * 날짜와 시간을 'YYYY-MM-DD HH:MM' 형식으로 포맷팅
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  return `${formatDate(d)} ${formatTime(d)}`;
}

/**
 * 현재 시간과 주어진 날짜 사이의 시간 차이를 계산하여 텍스트로 반환
 */
export function getTimeFromNow(date: Date | string | number): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = targetDate.getTime() - now.getTime();
  
  // 과거 시간인 경우
  if (diffMs < 0) {
    return '이미 지났습니다';
  }
  
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffDay > 0) {
    return `${diffDay}일 후`;
  } else if (diffHour > 0) {
    return `${diffHour}시간 후`;
  } else if (diffMin > 0) {
    return `${diffMin}분 후`;
  } else {
    return '곧 시작';
  }
} 