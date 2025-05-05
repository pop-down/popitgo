<script lang="ts">
  import { onMount } from 'svelte';
  import { eventsStore, type Event } from '../stores/events';
  import { authStore } from '../stores/auth';
  import Button from '../components/ui/Button.svelte';
  import Card from '../components/ui/Card.svelte';
  import EventCard from '../components/features/EventCard.svelte';
  import AddEventModal from '../components/features/AddEventModal.svelte';
  import { Calendar, Filter, User, Settings as SettingsIcon } from 'lucide-svelte';
  
  // 이벤트 데이터
  let events: Event[] = [];
  let isLoading: boolean = true;
  let error: string | null = null;
  
  // 필터링 상태
  let searchQuery: string = '';
  let selectedCategory: string = '';
  let showFilters: boolean = false;
  
  // 선택 상태
  let selectedEvents: string[] = [];
  
  // 모달 상태
  let isAddEventModalOpen = false;
  let isEditEventModalOpen = false;
  let currentEvent: Partial<Event> = {};
  let isSubmitting = false;
  let formError: string | null = null;
  
  // 현재 모드 (URL 쿼리 파라미터에서 가져옴)
  let currentMode: string = 'all';
  
  // URL에서 탭 정보 가져오기
  function getTabFromUrl(): string {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab');
    return tab === 'my-reservations' ? 'my-reservations' : 'all';
  }
  
  // URL 변경 감지 함수
  function updateModeFromUrl(): void {
    currentMode = getTabFromUrl();
  }
  
  // 로그인 페이지로 이동
  function navigateToLogin() {
    window.location.href = '/login';
  }
  
  onMount(() => {
    // 첫 로드 시 URL 확인
    updateModeFromUrl();
    
    // 이벤트 로드
    loadEvents();
    
    // 스토어 구독 설정
    const unsubscribe = eventsStore.subscribe(state => {
      events = state.events;
      isLoading = state.isLoading;
      error = state.error;
    });
    
    // popstate 이벤트 리스너 추가 (브라우저 뒤로가기/앞으로가기 감지)
    const handlePopState = () => {
      updateModeFromUrl();
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // 컴포넌트 언마운트 시 구독 및 이벤트 리스너 해제
    return () => {
      unsubscribe();
      window.removeEventListener('popstate', handlePopState);
    };
  });
  
  // 이벤트 로드
  async function loadEvents() {
    await eventsStore.fetchEvents();
  }
  
  // 새 이벤트 추가 모달 표시
  function showAddEvent() {
    currentEvent = {
      title: '',
      description: '',
      organizer: '',
      category: '',
      reservationStart: '',
      reservationPlatform: '',
      reservationLink: ''
    };
    isAddEventModalOpen = true;
  }
  
  // 이벤트 수정 모달 표시
  function showEditEvent(event: Event) {
    currentEvent = { ...event };
    isEditEventModalOpen = true;
  }
  
  // 이벤트 추가 처리
  async function handleAddEvent(event: CustomEvent<Event>) {
    try {
      isSubmitting = true;
      formError = null;
      
      const newEvent = event.detail;
      await eventsStore.addEvent({
        title: newEvent.title,
        description: newEvent.description,
        organizer: newEvent.organizer,
        category: newEvent.category,
        reservationStart: newEvent.reservationStart,
        reservationPlatform: newEvent.reservationPlatform,
        reservationLink: newEvent.reservationLink
      });
      
      isAddEventModalOpen = false;
    } catch (err) {
      console.error('이벤트 추가 중 오류 발생:', err);
      if (err instanceof Error) {
        formError = err.message;
      } else {
        formError = '이벤트를 추가하는 중 오류가 발생했습니다.';
      }
    } finally {
      isSubmitting = false;
    }
  }
  
  // 이벤트 삭제 처리
  async function handleDeleteEvent(id: string) {
    if (!confirm('이 이벤트를 삭제하시겠습니까?')) return;
    
    try {
      await eventsStore.deleteEvent(id);
    } catch (err) {
      console.error('이벤트 삭제 중 오류 발생:', err);
      alert('이벤트를 삭제하는 중 오류가 발생했습니다.');
    }
  }
  
  // 선택한 이벤트 삭제
  async function deleteSelectedEvents() {
    if (!selectedEvents.length) return;
    
    if (!confirm(`선택한 ${selectedEvents.length}개의 이벤트를 삭제하시겠습니까?`)) return;
    
    try {
      for (const id of selectedEvents) {
        await eventsStore.deleteEvent(id);
      }
      selectedEvents = [];
    } catch (err) {
      console.error('이벤트 일괄 삭제 중 오류 발생:', err);
      alert('이벤트를 삭제하는 중 오류가 발생했습니다.');
    }
  }
  
  // 이벤트 선택 토글
  function toggleEventSelection(id: string) {
    if (selectedEvents.includes(id)) {
      selectedEvents = selectedEvents.filter(eventId => eventId !== id);
    } else {
      selectedEvents = [...selectedEvents, id];
    }
  }
  
  // 모든 이벤트 선택
  function selectAllEvents() {
    if (currentMode === 'my-reservations') {
      selectedEvents = myReservations.map((event: { id: any; }) => event.id);
    }
  }
  
  // 선택 초기화
  function clearSelection() {
    selectedEvents = [];
  }
  
  // 필터 토글
  function toggleFilters() {
    showFilters = !showFilters;
  }
  
  // 이벤트 필터링
  $: filteredEvents = events.filter(event => {
    let matchesSearch = true;
    let matchesCategory = true;
    
    // 검색어 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch = Boolean(
        event.title.toLowerCase().includes(query) || 
        (event.description && event.description.toLowerCase().includes(query)) ||
        (event.organizer && event.organizer.toLowerCase().includes(query))
      );
    }
    
    // 카테고리 필터링
    matchesCategory = !selectedCategory || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // 예약 대기중인 이벤트
  $: upcomingEvents = filteredEvents.filter((event: { reservationStart: string | number | Date; }) => {
    const reservationTime = new Date(event.reservationStart);
    return reservationTime > new Date();
  });
  
  // 나의 예약 이벤트
  $: myReservations = filteredEvents.filter(event => {
    // 예약 설정한 이벤트 또는 알림 설정한 이벤트를 '나의 예약'으로 간주
    return event.hasNotification;
  });
  
  // 현재 모드에 따라 표시할 이벤트
  $: displayEvents = currentMode === 'my-reservations' ? myReservations : upcomingEvents;
  
  // 페이지 타이틀
  $: pageTitle = currentMode === 'my-reservations' ? '나의 예약' : '이벤트';
  
  // 카테고리 옵션
  const categoryOptions = [
    { value: '', label: '모든 카테고리' },
    { value: '콘서트', label: '콘서트' },
    { value: '전시회', label: '전시회' },
    { value: '공연', label: '공연' },
    { value: '페스티벌', label: '페스티벌' },
    { value: '스포츠', label: '스포츠' },
    { value: '굿즈', label: '굿즈' },
    { value: '기타', label: '기타' }
  ];
</script>

<div class="app-container">
  <main class="main-content">
    <div class="events-tab">
      <div class="header">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-2xl font-semibold mb-2">{pageTitle}</h1>
          
          <div class="flex gap-2">
            {#if $authStore.isLoggedIn}
              <Button variant="primary" onClick={showAddEvent}>이벤트 추가</Button>
            {:else}
              <!-- <Button variant="outline" onClick={navigateToLogin}>로그인</Button> -->
            {/if}
          </div>
        </div>
        
        <!-- {#if !$authStore.isLoggedIn}
          <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-blue-700">
                  로그인하면 이벤트 알림 설정, 개인 메모 추가 등 더 많은 기능을 사용할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        {/if} -->
        
        <div class="header-actions">
          <button class="filter-button" on:click={toggleFilters}>
            <Filter size={20} />
          </button>
        </div>
      </div>
      
      {#if showFilters}
        <div class="filter-panel">
          <div class="filter-group">
            <label for="search" class="block text-sm font-medium mb-1">검색</label>
            <input
              id="search"
              type="text"
              bind:value={searchQuery}
              placeholder="이벤트 제목이나 내용 검색..."
              class="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--primary]"
            />
          </div>
          
          <div class="filter-group">
            <label for="category" class="block text-sm font-medium mb-1">카테고리</label>
            <select
              id="category"
              bind:value={selectedCategory}
              class="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--primary]"
            >
              {#each categoryOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>
        </div>
      {/if}
      
      <div class="event-list">
        {#if isLoading}
          <div class="loading-state">
            <p>이벤트를 불러오는 중...</p>
          </div>
        {:else if error}
          <div class="error-state">
            <p>오류가 발생했습니다: {error}</p>
            <button on:click={loadEvents}>다시 시도</button>
          </div>
        {:else if displayEvents.length === 0}
          <div class="empty-state">
            {#if currentMode === 'my-reservations'}
              <p>예약된 이벤트가 없습니다</p>
            {:else}
              <p>표시할 이벤트가 없습니다</p>
              <button on:click={toggleFilters}>필터 조정하기</button>
            {/if}
          </div>
        {:else}
          {#each displayEvents as event (event.id)}
            <EventCard 
              id={event.id}
              title={event.title}
              description={event.description || ''}
              reservationStart={event.reservationStart}
              reservationPlatform={event.reservationPlatform || ''}
              reservationLink={event.reservationLink || ''}
              category={event.category || ''}
              organizer={event.organizer || ''}
              hasNotification={!!event.hasNotification}
              isMyReservation={currentMode === 'my-reservations'}
              onNotifyClick={() => toggleEventSelection(event.id)}
              on:select={(e) => toggleEventSelection(e.detail)}
            />
          {/each}
        {/if}
      </div>
    </div>
  </main>
  
  {#if isAddEventModalOpen}
    <AddEventModal
      isOpen={true}
      event={currentEvent}
      isSubmitting={isSubmitting}
      error={formError}
      on:close={() => isAddEventModalOpen = false}
      on:submit={handleAddEvent}
    />
  {/if}
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 100%;
    margin: 0 auto;
    background-color: white;
  }
  
  .main-content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 2rem;
  }
  
  .events-tab {
    padding: 0 1rem;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .header-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }
  
  h1 {
    font-size: 1.5rem;
    margin: 0;
    font-weight: 600;
  }
  
  .filter-button {
    background: none;
    border: 1px solid #ddd;
    border-radius: 50%;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  
  .filter-panel {
    background-color: #f9f9f9;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
    border: 1px solid #eee;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .event-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .empty-state, .loading-state, .error-state {
    text-align: center;
    padding: 2rem;
    color: #777;
  }
  
  .empty-state button, .error-state button {
    background-color: var(--primary);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    margin-top: 1rem;
    cursor: pointer;
  }
</style> 