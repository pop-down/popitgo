<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '../components/ui/Card.svelte';
  import Button from '../components/ui/Button.svelte';
  import { eventsStore, type Event } from '../stores/events';
  import { authStore } from '../stores/auth';
  import { formatDateTime, getTimeFromNow } from '../lib/utils/date';
  import { Bell, BellOff, ExternalLink } from 'lucide-svelte';
  
  // 현재 이벤트 ID
  let eventId: string = '';
  let event: Event | null = null;
  let isLoading = true;
  let error: string | null = null;
  let noteContent = '';
  let isSavingNote = false;
  let isLoadingNote = false;
  let noteError: string | null = null;
  
  // 알림 설정 상태
  let notificationTime = '30'; // 기본값: 30분 전
  let isSettingNotification = false;
  
  onMount(async () => {
    // URL에서 이벤트 ID 추출
    const pathSegments = window.location.pathname.split('/');
    eventId = pathSegments[pathSegments.length - 1];
    
    if (!eventId) return;
    await loadEventDetails();
  });
  
  // 로그인 페이지로 이동
  function navigateToLogin() {
    window.location.href = '/login';
  }
  
  // 이벤트 목록으로 이동
  function navigateToEvents() {
    window.location.href = '/events';
  }
  
  // 이벤트 상세 정보 로드
  async function loadEventDetails(): Promise<void> {
    isLoading = true;
    error = null;
    
    try {
      // 이벤트 상세 정보 가져오기
      event = await eventsStore.getEventById(eventId);
      
      // 사용자의 메모 가져오기
      if ($authStore.isLoggedIn && event) {
        isLoadingNote = true;
        try {
          const note = await eventsStore.getNoteForEvent(eventId);
          if (note) {
            noteContent = note.content;
          }
        } catch (err) {
          console.error('메모를 불러오는 중 오류 발생:', err);
          noteError = '메모를 불러올 수 없습니다.';
        } finally {
          isLoadingNote = false;
        }
      }
    } catch (err) {
      console.error('이벤트 상세 정보를 불러오는 중 오류 발생:', err);
      error = '이벤트 정보를 불러올 수 없습니다. 나중에 다시 시도해주세요.';
    } finally {
      isLoading = false;
    }
  }
  
  // 알림 설정 토글
  async function toggleNotification(): Promise<void> {
    if (!$authStore.isLoggedIn) {
      alert('알림을 설정하려면 로그인이 필요합니다.');
      return;
    }
    
    if (!event) return;
    
    isSettingNotification = true;
    
    try {
      if (event.hasNotification) {
        // 알림 해제
        await eventsStore.removeNotification(eventId);
      } else {
        // 알림 설정
        await eventsStore.setNotification(eventId, parseInt(notificationTime));
      }
      
      // 이벤트 데이터 다시 로드
      event = await eventsStore.getEventById(eventId);
    } catch (err) {
      console.error('알림 설정 중 오류 발생:', err);
      alert('알림 설정을 변경하는 중 오류가 발생했습니다.');
    } finally {
      isSettingNotification = false;
    }
  }
  
  // 메모 저장
  async function saveNote(): Promise<void> {
    if (!$authStore.isLoggedIn) {
      alert('메모를 저장하려면 로그인이 필요합니다.');
      return;
    }
    
    if (!event) return;
    
    isSavingNote = true;
    
    try {
      await eventsStore.saveNoteForEvent(eventId, noteContent);
      alert('메모가 저장되었습니다.');
    } catch (err) {
      console.error('메모 저장 중 오류 발생:', err);
      alert('메모를 저장하는 중 오류가 발생했습니다.');
    } finally {
      isSavingNote = false;
    }
  }
  
  // 돌아가기
  function goBack(): void {
    window.history.back();
  }
  
  // 공유 기능
  function shareEvent(): void {
    if (!event) return;
    
    if (navigator.share) {
      navigator.share({
        title: event.title || 'PopItGo 이벤트',
        text: `${event.title} - ${formatDateTime(event.reservationStart)}`,
        url: window.location.href
      }).catch(err => {
        console.error('공유 중 오류 발생:', err);
      });
    } else {
      // 공유 API를 지원하지 않는 브라우저
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl)
        .then(() => alert('링크가 클립보드에 복사되었습니다.'))
        .catch(() => alert('링크 복사에 실패했습니다. 수동으로 URL을 복사해주세요.'));
    }
  }
</script>

<div class="mb-4">
  <button 
    class="flex items-center text-neutral-700 hover:text-primary transition-colors"
    on:click={goBack}
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
    </svg>
    돌아가기
  </button>
</div>

<div class="event-detail">
  {#if isLoading}
    <div class="loading">이벤트 정보를 불러오는 중...</div>
  {:else if error}
    <div class="error">
      <p>오류가 발생했습니다: {error}</p>
      <Button variant="outline" onClick={() => loadEventDetails()}>다시 시도</Button>
    </div>
  {:else if event}
    <div class="event-header">
      <h1>{event.title}</h1>
      <div class="header-actions">
        {#if $authStore.isLoggedIn}
          <Button 
            variant={event.hasNotification ? "primary" : "outline"} 
            onClick={toggleNotification}
            className="notification-button"
          >
            {#if event.hasNotification}
              <Bell size={18} /> 알림 해제
            {:else}
              <BellOff size={18} /> 알림 설정
            {/if}
          </Button>
        {:else}
          <div class="login-prompt">
            <p class="mb-2 text-sm text-gray-600">알림 설정을 위해 로그인하세요</p>
            <Button variant="outline" onClick={navigateToLogin}>로그인</Button>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- 이벤트 상세 정보 -->
    <div class="event-info">
      <div class="info-item">
        <div class="label">예약 시작:</div>
        <div class="value">{formatDateTime(event.reservationStart)}</div>
      </div>
      
      {#if event.organizer}
        <div class="info-item">
          <div class="label">주최:</div>
          <div class="value">{event.organizer}</div>
        </div>
      {/if}
      
      {#if event.category}
        <div class="info-item">
          <div class="label">카테고리:</div>
          <div class="value">
            <span class="category-badge">{event.category}</span>
          </div>
        </div>
      {/if}
      
      {#if event.reservationPlatform}
        <div class="info-item">
          <div class="label">예약 플랫폼:</div>
          <div class="value">{event.reservationPlatform}</div>
        </div>
      {/if}
      
      {#if event.reservationLink}
        <div class="info-item">
          <div class="label">예약 링크:</div>
          <div class="value link">
            <a href={event.reservationLink} target="_blank" rel="noopener noreferrer">
              {event.reservationLink} <ExternalLink size={14} />
            </a>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- 이벤트 설명 -->
    {#if event.description}
      <div class="event-description">
        <h2>상세 설명</h2>
        <p>{event.description}</p>
      </div>
    {/if}
    
    <!-- 메모 섹션 -->
    <div class="event-notes">
      <h2>나의 메모</h2>
      
      {#if $authStore.isLoggedIn}
        {#if isLoadingNote}
          <p>메모를 불러오는 중...</p>
        {:else if noteError}
          <p class="error-text">메모를 불러오는 중 오류가 발생했습니다: {noteError}</p>
        {:else}
          <div class="note-editor">
            <textarea 
              bind:value={noteContent} 
              placeholder="이 이벤트에 대한 메모를 입력하세요"
              rows="4"
            ></textarea>
            <Button 
              variant="outline" 
              onClick={saveNote}
              disabled={isSavingNote}
            >
              {isSavingNote ? '저장 중...' : '메모 저장'}
            </Button>
          </div>
        {/if}
      {:else}
        <div class="login-prompt">
          <p>메모 기능을 사용하려면 로그인이 필요합니다.</p>
          <Button variant="outline" onClick={navigateToLogin}>로그인</Button>
        </div>
      {/if}
    </div>
    
    <!-- 이벤트 목록으로 -->
    <Button variant="outline" onClick={navigateToEvents}>이벤트 목록으로</Button>
  {:else}
    <div class="not-found">
      <p>이벤트를 찾을 수 없습니다.</p>
      <Button variant="outline" onClick={navigateToEvents}>이벤트 목록으로</Button>
    </div>
  {/if}
</div>

<style>
  .event-detail {
    background-color: white;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
  }
  
  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }
  
  .event-header h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
  }
  
  .header-actions {
    display: flex;
    align-items: center;
  }
  
  .event-info {
    background-color: #f9f9f9;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .info-item {
    display: flex;
    margin-bottom: 0.5rem;
  }
  
  .info-item .label {
    font-weight: 500;
    width: 110px;
    color: #666;
  }
  
  .info-item .value {
    flex: 1;
  }
  
  .info-item .link a {
    color: var(--primary);
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .category-badge {
    background-color: #e5e7eb;
    color: #4b5563;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
  }
  
  .event-description {
    margin-bottom: 1.5rem;
  }
  
  .event-description h2,
  .event-notes h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }
  
  .note-editor {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .note-editor textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    resize: vertical;
  }
  
  .login-prompt {
    background-color: #f3f4f6;
    border-radius: 0.375rem;
    padding: 1rem;
    text-align: center;
  }
  
  .loading, .error, .not-found {
    text-align: center;
    padding: 2rem 0;
  }
  
  .error {
    color: #ef4444;
  }
  
  .error-text {
    color: #ef4444;
    margin-bottom: 0.5rem;
  }
</style>