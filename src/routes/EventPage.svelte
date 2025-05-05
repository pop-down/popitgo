<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '../components/layout/Header.svelte';
  import Footer from '../components/layout/Footer.svelte';
  import EventCard from '../components/features/EventCard.svelte';
  import EventForm from '../components/features/EventForm.svelte';
  import Button from '../components/ui/Button.svelte';
  import Card from '../components/ui/Card.svelte';
  import { eventsStore, type Event } from '../stores/events';
  import { authStore } from '../stores/auth';
  
  // 상태 관리
  let showAddEventForm = false;
  let editingEvent: Partial<Event> | null = null;
  let isSubmitting = false;
  let searchQuery = '';
  let selectedCategory = '';
  let filteredEvents: Event[] = [];
  
  // 이벤트 스토어 구독
  $: {
    // 검색어와 카테고리로 이벤트 필터링
    if ($eventsStore.events) {
      filteredEvents = $eventsStore.events.filter(event => {
        const matchesSearch = !searchQuery || 
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = !selectedCategory || event.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
      });
      
      // 예약 시작 시간순으로 정렬
      filteredEvents.sort((a, b) => {
        const dateA = new Date(a.reservationStart).getTime();
        const dateB = new Date(b.reservationStart).getTime();
        return dateA - dateB;
      });
    }
  }
  
  // 컴포넌트 마운트 시 이벤트 데이터 로드
  onMount(() => {
    eventsStore.fetchEvents();
  });
  
  // 알림 설정/해제 처리
  function handleNotifyToggle(eventId: string) {
    eventsStore.toggleNotification(eventId);
  }
  
  // 이벤트 추가 폼 표시
  function showAddEvent() {
    showAddEventForm = true;
    editingEvent = null;
  }
  
  // 이벤트 편집 폼 표시
  function showEditEvent(event: Event) {
    editingEvent = { ...event };
    showAddEventForm = true;
  }
  
  // 이벤트 등록/편집 폼 취소
  function handleFormCancel() {
    showAddEventForm = false;
    editingEvent = null;
  }
  
  // 이벤트 등록/편집 폼 제출
  async function handleFormSubmit(event: CustomEvent) {
    const formData = event.detail;
    isSubmitting = true;
    
    try {
      if (editingEvent?.id) {
        // 이벤트 수정
        await eventsStore.updateEvent(editingEvent.id, formData);
      } else {
        // 새 이벤트 추가
        await eventsStore.addEvent(formData);
      }
      
      showAddEventForm = false;
      editingEvent = null;
    } catch (error) {
      console.error('이벤트 저장 중 오류 발생:', error);
      // 실제 구현에서는 사용자에게 오류 표시
    } finally {
      isSubmitting = false;
    }
  }
  
  // 이벤트 삭제
  async function handleDeleteEvent(id: string) {
    if (!confirm('정말 이 이벤트를 삭제하시겠습니까?')) return;
    
    try {
      await eventsStore.deleteEvent(id);
    } catch (error) {
      console.error('이벤트 삭제 중 오류 발생:', error);
      // 실제 구현에서는 사용자에게 오류 표시
    }
  }
</script>

<div class="min-h-screen flex flex-col bg-gray-50">
  <Header />
  
  <main class="container-app py-6 flex-grow">
    {#if showAddEventForm}
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-3">
          {editingEvent?.id ? '이벤트 수정' : '새 이벤트 등록'}
        </h2>
        
        <EventForm 
          event={editingEvent || {}} 
          {isSubmitting}
          on:submit={handleFormSubmit}
          on:cancel={handleFormCancel}
        />
      </div>
    {:else}
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-xl font-bold">이벤트 관리</h1>
        
        {#if $authStore.isLoggedIn}
          <Button variant="primary" onClick={showAddEvent}>
            이벤트 추가하기
          </Button>
        {/if}
      </div>
      
      <Card padding="md" class="mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <label for="search" class="block text-sm font-medium text-neutral-700 mb-1">검색</label>
            <input
              id="search"
              type="text"
              bind:value={searchQuery}
              placeholder="이벤트 제목이나 내용 검색..."
              class="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--primary]"
            />
          </div>
          
          <div>
            <label for="category" class="block text-sm font-medium text-neutral-700 mb-1">카테고리</label>
            <select
              id="category"
              bind:value={selectedCategory}
              class="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--primary]"
            >
              <option value="">모든 카테고리</option>
              {#each $eventsStore.events.map(e => e.category).filter((v, i, a) => v && a.indexOf(v) === i) as category}
                <option value={category}>{category}</option>
              {/each}
            </select>
          </div>
        </div>
      </Card>
      
      {#if $eventsStore.isLoading}
        <div class="text-center py-10">
          <p>이벤트 로딩 중...</p>
        </div>
      {:else if $eventsStore.error}
        <div class="text-center py-10 text-warning">
          <p>이벤트를 불러오는 중 오류가 발생했습니다: {$eventsStore.error}</p>
          <Button variant="outline" onClick={() => eventsStore.fetchEvents()} class="mt-4">
            다시 시도
          </Button>
        </div>
      {:else if filteredEvents.length === 0}
        <div class="text-center py-10">
          <p>표시할 이벤트가 없습니다.</p>
          {#if searchQuery || selectedCategory}
            <p class="mt-2">검색 조건을 변경해보세요.</p>
          {/if}
        </div>
      {:else}
        <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {#each filteredEvents as event (event.id)}
            <div class="relative">
              <EventCard 
                id={event.id}
                title={event.title}
                description={event.description}
                reservationStart={event.reservationStart}
                reservationPlatform={event.reservationPlatform}
                reservationLink={event.reservationLink}
                category={event.category}
                organizer={event.organizer}
                hasNotification={event.hasNotification}
                onNotifyClick={() => handleNotifyToggle(event.id)}
              />
              
              {#if $authStore.isLoggedIn}
                <div class="absolute top-2 right-2 flex space-x-1">
                  <button 
                    class="p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                    on:click={() => showEditEvent(event)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-neutral-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  
                  <button 
                    class="p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                    on:click={() => handleDeleteEvent(event.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-neutral-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </main>
  
  <Footer />
</div> 