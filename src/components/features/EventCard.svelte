<script lang="ts">
  import { fly } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import { formatDateTime, getTimeFromNow } from '../../lib/utils/date';
  import { Calendar, Clock, ExternalLink, ChevronDown, ChevronUp, Bell, BellOff, ArrowRight, Plus, ChevronRight } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { format } from 'date-fns';
  import { ko } from 'date-fns/locale';
  import { authStore } from '../../stores/auth';
  
  export let id: string;
  export let title: string;
  export let description: string = '';
  export let reservationStart: string | Date;
  export let reservationPlatform: string = '';
  export let reservationLink: string = '';
  export let category: string = '';
  export let organizer: string = '';
  export let hasNotification: boolean = false;
  export let isMyReservation: boolean = false;
  export let onNotifyClick: (() => void) | undefined = undefined;
  
  // 사용자의 방문 예정 시간 (기본값: 이벤트 시작 30분 전)
  export let visitTime: number = 30;
  
  // 사용자의 예약 목록 (여러 예약 지원)
  export let reservations: Array<{
    id: string;
    eventId: string;
    visitTime: number; // 이벤트 시작 기준 방문 예정 시간 (분 단위)
    seats?: string;
    memo?: string;
    createdAt: Date;
  }> = [];
  
  const dispatch = createEventDispatcher();
  
  let expanded = false;
  let editingReservation = false;
  let newReservation = {
    visitTime: visitTime,
    seats: '',
    memo: ''
  };
  
  // 예약 표시 텍스트
  $: reservationText = reservations.length > 0 
    ? `${reservations.length}개의 예약` 
    : isMyReservation ? '예약됨' : '';
  
  // 현재 시간과 비교
  const now = new Date();
  const reservationDate = new Date(reservationStart);
  $: isUpcoming = reservationDate > now;
  $: isPast = reservationDate < now;
  $: isActive = false; // 실제 활성 상태는 API에서 제공되어야 함
  
  // 상태 태그 계산
  $: statusTag = getStatusTag();
  
  // 브랜드명이 제목에 포함되어 있는지 확인하고 처리된 제목 반환
  $: processedTitle = processTitle(title, organizer);
  
  // 브랜드명 처리 함수
  function processTitle(title: string, organizer: string): string {
    if (!organizer || !title) return title;
    
    // 대소문자 구분 없이 제목에 브랜드명이 포함되어 있는지 확인
    if (title.toLowerCase().includes(organizer.toLowerCase())) {
      // 브랜드명 길이가 2글자 이상일 때만 처리
      if (organizer.length >= 2) {
        // 정규식으로 브랜드명 부분을 찾아 제거
        const regex = new RegExp(`${organizer}[\\s:-]*`, 'i');
        return title.replace(regex, '').trim();
      }
    }
    
    return title;
  }
  
  function getStatusTag(): { text: string; class: string } {
    if (isMyReservation || reservations.length > 0) return { text: 'Booked', class: 'status-booked' };
    if (isPast) return { text: 'Past', class: 'status-past' };
    if (isActive) return { text: 'Active', class: 'status-active' };
    return { text: 'Open', class: 'status-open' };
  }
  
  // 예약 시작 시간 포맷팅 (M/d HH:mm 형식)
  $: formattedReservationTime = formatReservationTime(reservationDate, isUpcoming);
  
  function formatReservationTime(date: Date, isUpcoming: boolean): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    if (isUpcoming) {
      return `${month}/${day} ${hours}:${minutes}~`;
    } else {
      return `~${month}/${day} ${hours}:${minutes}`;
    }
  }
  
  // 방문 시간 계산
  function calculateVisitTime(eventTime: Date, minutesBefore: number): Date {
    const visitTime = new Date(eventTime);
    visitTime.setMinutes(visitTime.getMinutes() - minutesBefore);
    return visitTime;
  }
  
  // 방문 시간 포맷팅
  function formatVisitTime(eventTime: Date, minutesBefore: number): string {
    const visitTime = calculateVisitTime(eventTime, minutesBefore);
    return format(visitTime, 'HH:mm', { locale: ko });
  }
  
  // 카테고리 배경색 계산
  $: categoryColor = getCategoryColor(category);
  
  // 예약 플랫폼 아이콘 선택
  $: platformIcon = getPlatformIcon(reservationPlatform);
  
  function getCategoryColor(cat: string): string {
    switch (cat.toLowerCase()) {
      case '콘서트': return 'bg-pink-100 text-pink-800';
      case '전시회': return 'bg-blue-100 text-blue-800';
      case '공연': return 'bg-purple-100 text-purple-800';
      case '페스티벌': return 'bg-yellow-100 text-yellow-800';
      case '스포츠': return 'bg-green-100 text-green-800';
      case '굿즈': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  function getPlatformIcon(platform: string): string {
    const lowerPlatform = platform.toLowerCase();
    
    if (lowerPlatform.includes('카카오')) return '🟡';
    if (lowerPlatform.includes('네이버')) return '🟢';
    if (lowerPlatform.includes('구글')) return '🔴';
    if (lowerPlatform.includes('인터파크')) return '🎫';
    if (lowerPlatform.includes('예스24')) return '📚';
    if (lowerPlatform.includes('멜론')) return '🎵';
    if (lowerPlatform.includes('티켓링크')) return '🔗';
    if (lowerPlatform.includes('쿠팡')) return '📦';
    
    return '🎟️';
  }
  
  function toggleExpand() {
    expanded = !expanded;
  }
  
  function handleSelectChange() {
    dispatch('select', id);
  }
  
  // 상세 페이지로 이동
  function navigateToDetail(e: Event) {
    e.stopPropagation(); // 이벤트 버블링 방지
    window.location.href = `/events/${id}`;
  }
  
  // 예약 편집 모드 토글
  function toggleEditReservation(e: Event) {
    e.stopPropagation(); // 이벤트 버블링 방지
    editingReservation = !editingReservation;
  }
  
  // 새 예약 추가
  function addReservation(e: Event) {
    e.stopPropagation(); // 이벤트 버블링 방지
    
    if (!$authStore.isLoggedIn) {
      alert('예약을 추가하려면 로그인이 필요합니다.');
      return;
    }
    
    // 새 예약 객체 생성
    const newRes = {
      id: crypto.randomUUID(), // 임시 ID 생성
      eventId: id,
      visitTime: newReservation.visitTime,
      seats: newReservation.seats || undefined,
      memo: newReservation.memo || undefined,
      createdAt: new Date()
    };
    
    // 예약 목록에 추가
    reservations = [...reservations, newRes];
    
    // 편집 모드 종료
    editingReservation = false;
    
    // 폼 초기화
    newReservation = {
      visitTime: visitTime,
      seats: '',
      memo: ''
    };
    
    // 상위 컴포넌트에 알림
    dispatch('reservationAdded', newRes);
  }
  
  // 예약 삭제
  function removeReservation(e: Event, resId: string) {
    e.stopPropagation(); // 이벤트 버블링 방지
    
    if (confirm('이 예약을 삭제하시겠습니까?')) {
      reservations = reservations.filter(res => res.id !== resId);
      
      // 상위 컴포넌트에 알림
      dispatch('reservationRemoved', resId);
    }
  }
</script>

<div 
  class="event-card {isMyReservation || reservations.length > 0 ? 'booked' : ''} {isPast ? 'past' : ''}" 
  on:click={toggleExpand}
  on:keydown={(e) => e.key === 'Enter' && toggleExpand()}
  tabindex="0"
  role="button"
  aria-expanded={expanded}
>
  <div class="event-header">
    <div class="event-title-row">
      <div class="title-container">
        {#if organizer}
          <div class="brand-title">
            <div class="title-with-brand">
              <span class="brand-name">{organizer}</span>
              <h2>{processedTitle}</h2>
            </div>
          </div>
        {:else}
          <h2>{title}</h2>
        {/if}
      </div>
      <div class="expand-icon">
        {#if expanded}
          <ChevronUp size={18} />
        {:else}
          <ChevronDown size={18} />
        {/if}
      </div>
    </div>
    <div class="event-meta">
      <span class="status-tag {statusTag.class}">{statusTag.text}</span>
      {#if category}
        <span class="category-badge {categoryColor}">{category}</span>
      {/if}
      <div class="event-time">
        <Clock size={12} />
        <span>{formattedReservationTime}</span>
      </div>
      {#if reservationPlatform}
        <span class="platform-icon">{platformIcon}</span>
      {/if}
      {#if reservationText}
        <span class="reservation-count">{reservationText}</span>
      {/if}
    </div>
  </div>
  
  {#if expanded}
    <div class="event-details" transition:fly={{ y: -20, duration: 200 }}>
      {#if description}
        <p class="event-description">{description}</p>
      {/if}
      <div class="event-schedule">
        <div class="schedule-item">
          <Calendar size={16} class="schedule-icon" />
          <span class="schedule-text">{format(reservationDate, 'yyyy년 MM월 dd일', { locale: ko })}</span>
        </div>
        <div class="schedule-item">
          <Clock size={16} class="schedule-icon" />
          <span class="schedule-text">{format(reservationDate, 'HH:mm', { locale: ko })} ({getTimeFromNow(reservationStart)})</span>
        </div>
      </div>
      
      <!-- 예약 목록 -->
      {#if reservations.length > 0}
        <div class="my-reservations">
          <h3 class="section-title">나의 예약 ({reservations.length}개)</h3>
          <div class="reservations-list">
            {#each reservations as res (res.id)}
              <div class="reservation-item">
                <div class="reservation-details">
                  <div class="reservation-time">
                    <Clock size={14} />
                    <span>방문 예정: {formatVisitTime(reservationDate, res.visitTime)}</span>
                    <span class="visit-minutes">({res.visitTime}분 전)</span>
                  </div>
                  {#if res.seats}
                    <div class="reservation-seats">좌석: {res.seats}</div>
                  {/if}
                  {#if res.memo}
                    <div class="reservation-memo">{res.memo}</div>
                  {/if}
                </div>
                <button class="delete-button" on:click={(e) => removeReservation(e, res.id)} on:keydown={(e) => e.key === 'Enter' && removeReservation(e, res.id)}>
                  삭제
                </button>
              </div>
            {/each}
          </div>
          
          {#if !editingReservation}
            <button class="add-reservation-button" on:click={toggleEditReservation} on:keydown={(e) => e.key === 'Enter' && toggleEditReservation(e)}>
              <Plus size={14} />
              예약 추가
            </button>
          {/if}
        </div>
      {/if}
      
      <!-- 예약 추가 폼 -->
      {#if editingReservation}
        <div class="reservation-form">
          <h3 class="form-title">새 예약 추가</h3>
          <div class="form-row">
            <label for="visitTime">방문 예정 시간</label>
            <select id="visitTime" bind:value={newReservation.visitTime}>
              <option value={0}>이벤트 시작 시간</option>
              <option value={15}>15분 전</option>
              <option value={30}>30분 전</option>
              <option value={60}>1시간 전</option>
              <option value={90}>1시간 30분 전</option>
              <option value={120}>2시간 전</option>
            </select>
          </div>
          <div class="form-row">
            <label for="seats">좌석 정보 (선택)</label>
            <input type="text" id="seats" bind:value={newReservation.seats} placeholder="예: A열 22번">
          </div>
          <div class="form-row">
            <label for="memo">메모 (선택)</label>
            <textarea id="memo" bind:value={newReservation.memo} placeholder="예약 관련 메모"></textarea>
          </div>
          <div class="form-actions">
            <button class="cancel-button" on:click={toggleEditReservation}>
              취소
            </button>
            <button class="save-button" on:click={addReservation}>
              예약 추가
            </button>
          </div>
        </div>
      {/if}
      
      <!-- 액션 버튼 -->
      <div class="event-actions">
        {#if isUpcoming && (reservations.length === 0 && !editingReservation)}
          {#if !isMyReservation}
            <Button variant="primary" className="book-button" onClick={() => toggleEditReservation(new Event('click'))}>
              예약 추가하기
            </Button>
          {/if}
          
          {#if onNotifyClick}
            <Button 
              variant={hasNotification ? "primary" : "outline"} 
              className="reminder-button {hasNotification ? 'active' : ''}" 
              onClick={() => {
                if (!$authStore.isLoggedIn) {
                  alert('알림 설정을 위해서는 로그인이 필요합니다.');
                  return;
                }
                onNotifyClick();
              }}
            >
              {#if hasNotification}
                <BellOff size={16} />
                알림 해제
              {:else}
                <Bell size={16} />
                알림 설정
              {/if}
            </Button>
          {/if}
        {/if}
        
        <div class="bottom-actions">
          {#if reservationLink}
            <a 
              href={reservationLink} 
              target="_blank"
              rel="noopener noreferrer" 
              class="booking-link"
              on:click|stopPropagation
            >
              <ExternalLink size={16} />
              예약 링크로 이동
            </a>
          {/if}
          
          <button 
            class="detail-button" 
            on:click={navigateToDetail}
            on:keydown={(e) => e.key === 'Enter' && navigateToDetail(e)}
            aria-label="상세 페이지로 이동"
          >
            <ChevronRight size={16} />
            상세 보기
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .event-card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    border: 1px solid #eee;
    transition: all 0.2s ease;
    margin-bottom: 0.5rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .event-card:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .event-card.booked {
    border-left: 3px solid #4caf50;
  }
  
  .event-card.past {
    opacity: 0.7;
  }
  
  .event-header {
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    width: 100%;
    box-sizing: border-box;
  }
  
  .event-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
    width: 100%;
    box-sizing: border-box;
  }
  
  .title-container {
    flex: 1;
    overflow: hidden;
    min-width: 0;
  }
  
  .brand-title {
    width: 100%;
  }
  
  .title-with-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    max-width: 100%;
    overflow: hidden;
  }
  
  .brand-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: #666;
    white-space: nowrap;
    background-color: #f5f5f5;
    padding: 0.1rem 0.3rem;
    border-radius: 0.25rem;
    max-width: 30%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .expand-icon {
    display: flex;
    align-items: center;
    margin-left: 0.5rem;
    color: #666;
    flex-shrink: 0;
  }
  
  .event-title-row h2 {
    font-size: 0.95rem;
    margin: 0;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .event-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.7rem;
    color: #666;
    width: 100%;
    box-sizing: border-box;
  }
  
  .status-tag {
    display: inline-block;
    padding: 0.1rem 0.3rem;
    border-radius: 0.25rem;
    font-size: 0.65rem;
    font-weight: 600;
  }
  
  .status-open {
    background-color: #e3f2fd;
    color: #0d47a1;
  }
  
  .status-booked {
    background-color: #e8f5e9;
    color: #1b5e20;
  }
  
  .status-active {
    background-color: #fff8e1;
    color: #ff6f00;
  }
  
  .status-past {
    background-color: #f5f5f5;
    color: #757575;
  }
  
  .category-badge {
    display: inline-block;
    padding: 0.1rem 0.3rem;
    border-radius: 1rem;
    font-size: 0.65rem;
    font-weight: 500;
    max-width: fit-content;
  }
  
  .event-organizer {
    font-weight: 500;
  }
  
  .event-time {
    display: flex;
    align-items: center;
    gap: 0.15rem;
  }
  
  .platform-icon {
    font-size: 0.95rem;
  }
  
  .reservation-count {
    font-size: 0.7rem;
    font-weight: 500;
    color: #4caf50;
  }
  
  .event-details {
    padding: 0 0.75rem 0.75rem;
    border-top: 1px solid #eee;
    font-size: 0.85rem;
    overflow-wrap: break-word;
    word-break: break-word;
    overflow: hidden;
    width: 100%;
    box-sizing: border-box;
    max-width: 100%;
  }
  
  .event-description {
    margin: 0.75rem 0;
    line-height: 1.4;
    color: #555;
    max-width: 100%;
    overflow-wrap: break-word;
  }
  
  .event-schedule {
    margin: 0.75rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 100%;
  }
  
  .schedule-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    overflow-wrap: break-word;
    word-break: break-word;
    width: 100%;
    box-sizing: border-box;
  }
  
  .schedule-icon {
    flex-shrink: 0;
  }
  
  .schedule-text {
    flex: 1;
    white-space: normal;
    overflow-wrap: break-word;
    word-break: break-word;
  }
  
  .my-reservations {
    margin: 0.75rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;
  }
  
  .section-title {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0;
    color: #444;
  }
  
  .reservations-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;
  }
  
  .reservation-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background-color: #f9f9f9;
    border-radius: 0.375rem;
    border-left: 3px solid #4caf50;
    max-width: 100%;
    flex-wrap: wrap;
    box-sizing: border-box;
    width: 100%;
  }
  
  .reservation-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    min-width: 0;
    max-width: calc(100% - 60px);
  }
  
  .reservation-time {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-weight: 500;
    flex-wrap: wrap;
    width: 100%;
  }
  
  .visit-minutes {
    opacity: 0.7;
    font-size: 0.8em;
  }
  
  .reservation-seats {
    font-size: 0.8rem;
    color: #555;
    overflow-wrap: break-word;
    width: 100%;
  }
  
  .reservation-memo {
    font-size: 0.8rem;
    color: #666;
    font-style: italic;
    overflow-wrap: break-word;
    width: 100%;
  }
  
  .delete-button {
    background-color: #fee2e2;
    color: #ef4444;
    border: none;
    border-radius: 0.25rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-left: 0.5rem;
    flex-shrink: 0;
  }
  
  .delete-button:hover {
    background-color: #fecaca;
  }
  
  .add-reservation-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    background-color: #f0f9ff;
    color: #3b82f6;
    border: 1px dashed #bfdbfe;
    border-radius: 0.375rem;
    padding: 0.5rem;
    width: 100%;
    cursor: pointer;
    transition: background-color 0.2s;
    box-sizing: border-box;
  }
  
  .add-reservation-button:hover {
    background-color: #e0f2fe;
  }
  
  .reservation-form {
    margin: 0.75rem 0;
    background-color: #f5f5f5;
    border-radius: 0.375rem;
    padding: 0.75rem;
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;
  }
  
  .form-title {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: #444;
  }
  
  .form-row {
    margin-bottom: 0.75rem;
    width: 100%;
    box-sizing: border-box;
  }
  
  .form-row label {
    display: block;
    font-size: 0.8rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
    color: #555;
  }
  
  .form-row input,
  .form-row select,
  .form-row textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    font-size: 0.85rem;
    box-sizing: border-box;
  }
  
  .form-row textarea {
    min-height: 60px;
    resize: vertical;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    width: 100%;
    box-sizing: border-box;
  }
  
  .cancel-button {
    background-color: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    cursor: pointer;
  }
  
  .save-button {
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 0.25rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    cursor: pointer;
  }
  
  .event-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.75rem;
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;
  }
  
  .bottom-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-top: 0.5rem;
    flex-wrap: wrap;
    gap: 0.5rem;
    box-sizing: border-box;
  }
  
  .booked-status {
    background-color: #e8f5e9;
    color: #2e7d32;
    padding: 0.4rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
  }
  
  .booking-link {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.4rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
    cursor: pointer;
    border: none;
    font-weight: 500;
    background-color: #eee;
    color: #333;
    text-decoration: none;
    max-width: calc(50% - 0.25rem);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .book-button {
    background-color: var(--primary);
    color: white;
    width: 100%;
    box-sizing: border-box;
  }
  
  .reminder-button.active {
    background-color: #4caf50;
    color: white;
  }
  
  .detail-button {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background-color: #f0f9ff;
    color: #3b82f6;
    border: none;
    border-radius: 0.25rem;
    padding: 0.4rem 0.5rem;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background-color 0.2s;
    max-width: calc(50% - 0.25rem);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .detail-button:hover {
    background-color: #e0f2fe;
  }
</style> 