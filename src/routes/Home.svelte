<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '../components/ui/Button.svelte';
  import { eventsStore, type Event } from '../stores/events';
  import { formatDateTime, getTimeFromNow } from '../lib/utils/date';
  import { Calendar, Clock, AlertTriangle, X, ChevronRight } from 'lucide-svelte';
  import EventCard from '../components/features/EventCard.svelte';
  
  // 다가오는 이벤트
  let upcomingEvents: Event[] = [];
  let isLoading = true;
  let error: string | null = null;
  
  // 팝업 상태 관리
  let showPopup = false;
  
  onMount(async () => {
    await loadUpcomingEvents();
    
    // localStorage에서 팝업 표시 여부 확인
    const hasSeenPopup = localStorage.getItem('hasSeenWelcomePopup');
    if (!hasSeenPopup) {
      showPopup = true;
    }
  });
  
  // 다가오는 이벤트 로드
  async function loadUpcomingEvents() {
    isLoading = true;
    error = null;
    
    try {
      await eventsStore.fetchEvents();
      
      // 스토어에서 이벤트 데이터 가져오기
      let storeEvents: Event[] = [];
      const unsubscribe = eventsStore.subscribe(state => {
        storeEvents = state.events;
      });
      unsubscribe(); // 즉시 구독 해제
      
      // 현재 시간 이후의 이벤트만 필터링
      const now = new Date();
      upcomingEvents = storeEvents
        .filter(event => new Date(event.reservationStart) > now)
        .sort((a, b) => new Date(a.reservationStart).getTime() - new Date(b.reservationStart).getTime())
        .slice(0, 3); // 최대 3개만 표시
    } catch (err) {
      console.error('이벤트 데이터를 불러오는 중 오류 발생:', err);
      error = '이벤트 정보를 불러올 수 없습니다.';
    } finally {
      isLoading = false;
    }
  }
  
  // 이벤트 상세 페이지로 이동
  function navigateToEventDetail(eventId: string) {
    window.location.href = `/events/${eventId}`;
  }
  
  // 이벤트 목록 페이지로 이동
  function navigateToEvents() {
    window.location.href = '/events';
  }
  
  // 팝업 닫기
  function closePopup() {
    showPopup = false;
    localStorage.setItem('hasSeenWelcomePopup', 'true');
  }
</script>

<div class="home-container">
  <!-- 다가오는 이벤트 섹션 -->
  <section class="upcoming-events">
    <div class="section-header">
      <h2>곧 예매가 시작됩니다</h2>
      <Button variant="ghost" size="sm" onClick={navigateToEvents} className="view-more">
        <span>더보기</span>
        <ChevronRight size={16} />
      </Button>
    </div>
    
    {#if isLoading}
      <div class="text-center py-6">
        <p>이벤트 로딩 중...</p>
      </div>
    {:else if error}
      <div class="text-center py-6 text-red-500">
        <p>이벤트를 불러오는 중 오류가 발생했습니다: {error}</p>
        <Button variant="outline" onClick={loadUpcomingEvents}>
          다시 시도
        </Button>
      </div>
    {:else if upcomingEvents.length === 0}
      <div class="text-center py-6">
        <p>표시할 이벤트가 없습니다.</p>
      </div>
    {:else}
      <div class="events-grid">
        {#each upcomingEvents as event (event.id)}
          <div class="event-container"> 
            <EventCard 
              id={event.id}
              title={event.title}
              description={event.description || ''}
              reservationStart={event.reservationStart}
              reservationPlatform={event.reservationPlatform || ''}
              reservationLink={event.reservationLink || ''}
              category={event.category || ''}
              organizer={event.organizer || ''}
              hasNotification={event.hasNotification || false}
            />
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>

<!-- 팝업 컴포넌트 -->
{#if showPopup}
  <div class="popup-overlay" on:click={closePopup} on:keydown={(e) => e.key === 'Escape' && closePopup()} tabindex="0">
    <div class="popup-content" on:click|stopPropagation={() => {}} on:keydown|stopPropagation={() => {}} role="dialog" aria-modal="true">
      <button class="popup-close" on:click={closePopup} aria-label="팝업 닫기">
        <X size={24} />
      </button>
      
      <!-- 홈 헤로 섹션 -->
      <div class="popup-inner">
        <section class="hero-section">
          <h1>예약& 방문 알림을<br>놓치지 마세요</h1>
          <p>다양한 이벤트의 예매 시작 시간을 관리하세요</p>
          <div class="hero-actions">
            <Button variant="primary" onClick={closePopup}>이벤트 관리하기</Button>
          </div>
        </section>

        <section class="features-section">
          <h2>예약 관리를 쉽고 간편하게</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">🔔</div>
              <h3>예매 알림</h3>
              <p>중요한 예매 오픈 시간을 놓치지 않도록 알림을 설정하세요.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📅</div>
              <h3>일정 관리</h3>
              <p>다양한 이벤트의 예매 일정을 한눈에 확인하고 관리하세요.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">✅</div>
              <h3>다중 예약</h3>
              <p>하나의 이벤트에 여러 예약을 추가하고 메모를 관리하세요.</p>
            </div>
          </div>
        </section>
      </div>
      
      <div class="popup-actions">
        <Button variant="primary" onClick={closePopup}>시작하기</Button>
      </div>
    </div>
  </div>
{/if}

<style>
  .home-container {
    max-width: 100%;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    padding-bottom: 2rem;
    width: 100vw;
    box-sizing: border-box;
  }
  
  .upcoming-events {
    padding: 0 1rem 1rem;
    width: 100%;
    box-sizing: border-box;
    max-width: 100%;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .section-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }
  
  .view-more {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .events-grid {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: 1fr;
    width: 100%;
    max-width: calc(100vw - 2rem);
  }
  
  .event-container {
    width: 100%;
    height: auto;
    display: flex;
    max-width: 100%;
    overflow: hidden;
    box-sizing: border-box;
  }
  
  /* 팝업 스타일 */
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    box-sizing: border-box;
    padding: 0;
  }
  
  .popup-content {
    background-color: white;
    border-radius: 1rem;
    width: 90%;
    max-width: 450px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    position: relative;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    overflow: hidden;
  }
  
  .popup-inner {
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1;
  }
  
  .popup-close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .popup-actions {
    padding: 1rem;
    display: flex;
    justify-content: center;
    background-color: white;
    border-top: 1px solid #f0f0f0;
    width: 100%;
    box-sizing: border-box;
  }
  
  /* 헤로 섹션 (팝업 내부) */
  .hero-section {
    padding: 1.5rem 1rem;
    background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
    color: white;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
  }
  
  .hero-section h1 {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    line-height: 1.2;
  }
  
  .hero-section p {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
    opacity: 0.9;
    line-height: 1.5;
  }
  
  .hero-actions {
    display: flex;
    justify-content: center;
  }
  
  /* 기능 섹션 (팝업 내부) */
  .features-section {
    padding: 1.5rem 1rem;
    background-color: #f9fafb;
    width: 100%;
    box-sizing: border-box;
  }
  
  .features-section h2 {
    text-align: center;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }
  
  .features-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
    width: 100%;
    box-sizing: border-box;
  }
  
  .feature-card {
    background-color: white;
    padding: 1.25rem;
    border-radius: 0.75rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    text-align: center;
  }
  
  .feature-icon {
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }
  
  .feature-card h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .feature-card p {
    color: #6b7280;
    line-height: 1.4;
    font-size: 0.9rem;
  }
  
  @media (min-width: 640px) {
    .events-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .features-grid {
      grid-template-columns: repeat(3, 1fr);
    }
    
    .hero-section h1 {
      font-size: 2rem;
    }
    
    .hero-section p {
      font-size: 1rem;
    }
  }
  
  @media (min-width: 768px) {
    .popup-content {
      max-width: 500px;
    }
    
    .hero-section,
    .features-section {
      padding: 2rem 1.5rem;
    }
  }
  
  @media (min-width: 1024px) {
    .events-grid {
      grid-template-columns: repeat(3, 1fr);
    }
    
    .popup-content {
      max-width: 550px;
    }
  }
</style> 