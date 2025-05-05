<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Event } from '../../stores/events';
  import Button from '../ui/Button.svelte';
  
  // 이벤트 폼 디스패처
  const dispatch = createEventDispatcher<{
    submit: Event;
    cancel: void;
  }>();
  
  // 입력값
  export let event: Partial<Event> = {
    title: '',
    description: '',
    organizer: '',
    category: '',
    reservationStart: '',
    reservationPlatform: '',
    reservationLink: ''
  };
  
  export let isSubmitting = false;
  export let error: string | null = null;
  
  // 카테고리 옵션
  const categoryOptions = [
    '콘서트',
    '전시회',
    '공연',
    '페스티벌',
    '스포츠',
    '굿즈',
    '기타'
  ];
  
  // 플랫폼 옵션
  const platformOptions = [
    '인터파크',
    '티켓링크',
    '예스24',
    '멜론티켓',
    '네이버예약',
    '카카오톡',
    '기타'
  ];
  
  // 폼 제출
  function handleSubmit() {
    // 유효성 검사
    if (!event.title) {
      error = '이벤트 제목을 입력해주세요.';
      return;
    }
    
    if (!event.reservationStart) {
      error = '예약 시작 시간을 설정해주세요.';
      return;
    }
    
    // 이벤트 제출
    dispatch('submit', event as Event);
  }
  
  // 취소
  function handleCancel() {
    dispatch('cancel');
  }
  
  // 날짜와 시간을 로컬 ISO 형식으로 변환
  function formatDateTimeLocal(dateString: string | Date): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // YYYY-MM-DDThh:mm 형식으로 변환
    return date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0') + 'T' + 
      String(date.getHours()).padStart(2, '0') + ':' + 
      String(date.getMinutes()).padStart(2, '0');
  }
  
  // ISO 형식의 문자열을 Date 객체로 변환
  function parseISOString(dateString: string): Date {
    return new Date(dateString);
  }
  
  // reservationStart를 항상 ISO 형식으로 유지
  $: {
    if (event.reservationStart) {
      if (typeof event.reservationStart === 'string' && !event.reservationStart.includes('T')) {
        event.reservationStart = new Date(event.reservationStart).toISOString();
      }
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
  <h2 class="text-xl font-bold text-neutral-800">{event.id ? '이벤트 수정' : '새 이벤트 추가'}</h2>
  
  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  {/if}
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- 이벤트 제목 -->
    <div class="md:col-span-2">
      <label for="title" class="block text-sm font-medium text-neutral-700 mb-1">이벤트 제목 *</label>
      <input
        id="title"
        type="text"
        bind:value={event.title}
        placeholder="이벤트 제목을 입력하세요"
        required
        class="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--primary]"
      />
    </div>
    
    <!-- 이벤트 설명 -->
    <div class="md:col-span-2">
      <label for="description" class="block text-sm font-medium text-neutral-700 mb-1">이벤트 설명</label>
      <textarea
        id="description"
        bind:value={event.description}
        placeholder="이벤트에 대한 설명을 입력하세요"
        rows="3"
        class="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--primary]"
      ></textarea>
    </div>
    
    <!-- 주최자 -->
    <div>
      <label for="organizer" class="block text-sm font-medium text-neutral-700 mb-1">주최자</label>
      <input
        id="organizer"
        type="text"
        bind:value={event.organizer}
        placeholder="주최자 이름"
        class="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--primary]"
      />
    </div>
    
    <!-- 카테고리 -->
    <div>
      <label for="category" class="block text-sm font-medium text-neutral-700 mb-1">카테고리</label>
      <select
        id="category"
        bind:value={event.category}
        class="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--primary]"
      >
        <option value="" disabled>카테고리 선택</option>
        {#each categoryOptions as category}
          <option value={category}>{category}</option>
        {/each}
      </select>
    </div>
    
    <!-- 예약 시작 시간 -->
    <div>
      <label for="reservationStart" class="block text-sm font-medium text-neutral-700 mb-1">예약 시작 시간 *</label>
      <input
        id="reservationStart"
        type="datetime-local"
        bind:value={event.reservationStart}
        required
        class="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--primary]"
      />
    </div>
    
    <!-- 예약 플랫폼 -->
    <div>
      <label for="reservationPlatform" class="block text-sm font-medium text-neutral-700 mb-1">예약 플랫폼</label>
      <select
        id="reservationPlatform"
        bind:value={event.reservationPlatform}
        class="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--primary]"
      >
        <option value="" disabled>플랫폼 선택</option>
        {#each platformOptions as platform}
          <option value={platform}>{platform}</option>
        {/each}
      </select>
    </div>
    
    <!-- 예약 링크 -->
    <div class="md:col-span-2">
      <label for="reservationLink" class="block text-sm font-medium text-neutral-700 mb-1">예약 링크</label>
      <input
        id="reservationLink"
        type="url"
        bind:value={event.reservationLink}
        placeholder="https://example.com/reservation"
        class="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--primary]"
      />
    </div>
  </div>
  
  <div class="flex space-x-4 justify-end">
    <Button 
      variant="outline" 
      onClick={handleCancel} 
      disabled={isSubmitting}
    >
      취소
    </Button>
    
    <Button 
      type="submit" 
      variant="primary" 
      disabled={isSubmitting}
    >
      {isSubmitting ? '처리 중...' : event.id ? '수정하기' : '추가하기'}
    </Button>
  </div>
</form> 