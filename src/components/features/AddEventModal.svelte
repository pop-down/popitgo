<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Event } from '../../stores/events';
  import Card from '../ui/Card.svelte';
  import AddEventForm from './AddEventForm.svelte';
  
  // 모달 속성
  export let isOpen = false;
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
  
  // 이벤트 디스패처
  const dispatch = createEventDispatcher<{
    close: void;
    submit: Event;
  }>();
  
  // 모달 닫기
  function handleClose() {
    dispatch('close');
  }
  
  // 이벤트 제출
  function handleSubmit(event: CustomEvent<Event>) {
    dispatch('submit', event.detail);
  }
  
  // 취소
  function handleCancel() {
    handleClose();
  }
  
  // ESC 키 처리
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      handleClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- 모달 백드롭 -->
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    on:click={handleClose}
    on:keydown={(e) => e.key === 'Enter' && handleClose()}
    tabindex="0"
    role="button"
    aria-label="모달 닫기"
  >
    <!-- 모달 내용 -->
    <div 
      class="w-full max-w-2xl"
      on:click|stopPropagation={() => {}}
      on:keydown|stopPropagation={() => {}}
      tabindex="0"
      role="dialog"
      aria-modal="true"
    >
      <Card padding="lg" shadow="lg" className="max-h-[90vh] overflow-y-auto">
        <button
          class="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
          on:click={handleClose}
          aria-label="닫기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <AddEventForm
          bind:event
          bind:isSubmitting
          bind:error
          on:submit={handleSubmit}
          on:cancel={handleCancel}
        />
      </Card>
    </div>
  </div>
{/if} 