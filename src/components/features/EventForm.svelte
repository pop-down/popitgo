<!--
  이벤트 등록 및 수정을 위한 폼 컴포넌트
  새 이벤트 추가 또는 기존 이벤트 수정에 사용됩니다.
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '../ui/Button.svelte';
  import Input from '../ui/Input.svelte';
  import Card from '../ui/Card.svelte';
  import { EVENT_CATEGORIES } from '../../lib/constants/app';
  import type { Event } from '../../stores/events';
  
  // props
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
  
  // 내부 상태 관리
  let title = event.title || '';
  let description = event.description || '';
  let category = event.category || '';
  let organizer = event.organizer || '';
  let reservationPlatform = event.reservationPlatform || '';
  let reservationLink = event.reservationLink || '';
  
  // 날짜/시간 처리
  let reservationDate = '';
  let reservationTime = '';
  
  if (event.reservationStart) {
    const date = new Date(event.reservationStart);
    reservationDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
    reservationTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`; // HH:MM
  }
  
  // 유효성 검사
  let errors = {
    title: '',
    reservationDate: '',
    reservationTime: '',
    category: '',
  };
  
  function validateForm() {
    let isValid = true;
    errors = {
      title: '',
      reservationDate: '',
      reservationTime: '',
      category: '',
    };
    
    if (!title.trim()) {
      errors.title = '이벤트 제목을 입력해주세요';
      isValid = false;
    }
    
    if (!reservationDate) {
      errors.reservationDate = '예약 시작 날짜를 입력해주세요';
      isValid = false;
    }
    
    if (!reservationTime) {
      errors.reservationTime = '예약 시작 시간을 입력해주세요';
      isValid = false;
    }
    
    if (!category) {
      errors.category = '카테고리를 선택해주세요';
      isValid = false;
    }
    
    return isValid;
  }
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    submit: Event;
    cancel: void;
  }>();
  
  function handleSubmit() {
    if (!validateForm()) return;
    
    // 날짜와 시간 결합
    const reservationDateTime = new Date(`${reservationDate}T${reservationTime}`);
    
    // 폼 데이터 수집
    const formData = {
      title,
      description,
      category,
      organizer,
      reservationPlatform,
      reservationLink,
      reservationStart: reservationDateTime,
    };
    
    // 제출 이벤트 발생
    dispatch('submit', formData as Event);
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
  
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

<Card padding="lg">
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <h2 class="text-lg font-semibold mb-4">
      {event.id ? '이벤트 수정' : '새 이벤트 등록'}
    </h2>
    
    {#if error}
      <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    {/if}
    
    <div>
      <label for="title" class="block text-sm font-medium text-neutral-700 mb-1">이벤트 제목 *</label>
      <Input 
        id="title"
        type="text"
        bind:value={title}
        placeholder="예: 인기 콘서트 티켓팅"
        error={errors.title}
        required
      />
    </div>
    
    <div>
      <label for="description" class="block text-sm font-medium text-neutral-700 mb-1">이벤트 설명</label>
      <textarea
        id="description"
        bind:value={description}
        placeholder="이벤트에 대한 간략한 설명을 입력하세요"
        class="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--primary] min-h-24"
      ></textarea>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="category" class="block text-sm font-medium text-neutral-700 mb-1">카테고리 *</label>
        <select 
          id="category"
          bind:value={category}
          class="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--primary]"
        >
          <option value="">카테고리 선택</option>
          {#each categoryOptions as categoryOption}
            <option value={categoryOption}>{categoryOption}</option>
          {/each}
        </select>
        {#if errors.category}
          <p class="text-red-500 text-sm mt-1">{errors.category}</p>
        {/if}
      </div>
      
      <div>
        <label for="organizer" class="block text-sm font-medium text-neutral-700 mb-1">주최자/기관</label>
        <Input 
          id="organizer"
          type="text"
          bind:value={organizer}
          placeholder="예: 공연기획사명"
        />
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="reservationDate" class="block text-sm font-medium text-neutral-700 mb-1">예약 시작 날짜 *</label>
        <Input 
          id="reservationDate"
          type="date"
          bind:value={reservationDate}
          error={errors.reservationDate}
          required
        />
      </div>
      
      <div>
        <label for="reservationTime" class="block text-sm font-medium text-neutral-700 mb-1">예약 시작 시간 *</label>
        <Input 
          id="reservationTime"
          type="time"
          bind:value={reservationTime}
          error={errors.reservationTime}
          required
        />
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="reservationPlatform" class="block text-sm font-medium text-neutral-700 mb-1">예약 플랫폼</label>
        <select
          id="reservationPlatform"
          bind:value={reservationPlatform}
          class="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--primary]"
        >
          <option value="">플랫폼 선택</option>
          {#each platformOptions as platform}
            <option value={platform}>{platform}</option>
          {/each}
        </select>
      </div>
      
      <div>
        <label for="reservationLink" class="block text-sm font-medium text-neutral-700 mb-1">예약 링크</label>
        <Input 
          id="reservationLink"
          type="url"
          bind:value={reservationLink}
          placeholder="https://example.com"
        />
      </div>
    </div>
    
    <div class="flex justify-end space-x-2 pt-4">
      <Button 
        variant="outline" 
        type="button" 
        onClick={handleCancel}
      >
        취소
      </Button>
      
      <Button 
        variant="primary" 
        type="submit" 
        disabled={isSubmitting}
      >
        {isSubmitting ? '처리 중...' : event.id ? '이벤트 수정' : '이벤트 등록'}
      </Button>
    </div>
  </form>
</Card> 