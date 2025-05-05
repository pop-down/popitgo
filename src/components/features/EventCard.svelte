<script lang="ts">
  import Card from '../ui/Card.svelte';
  import Button from '../ui/Button.svelte';
  import { formatDateTime, getTimeFromNow } from '../../lib/utils/date';
  
  export let id: string;
  export let title: string;
  export let description: string = '';
  export let reservationStart: string | Date;
  export let reservationPlatform: string = '';
  export let reservationLink: string = '';
  export let category: string = '';
  export let organizer: string = '';
  export let onNotifyClick: (() => void) | undefined = undefined;
  export let hasNotification: boolean = false;
</script>

<Card hover={true} border={true} padding="md" shadow="md">
  <div class="flex flex-col h-full">
    <div class="flex justify-between items-start mb-2">
      <h3 class="text-lg font-semibold text-neutral-800">{title}</h3>
      
      {#if category}
        <span class="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">{category}</span>
      {/if}
    </div>
    
    {#if description}
      <p class="text-sm text-neutral-600 mb-3 line-clamp-2">{description}</p>
    {/if}
    
    <div class="mt-auto">
      <div class="text-sm text-neutral-500 mb-1">
        <div class="flex items-center">
          <span class="font-medium">예약 시작:</span>
          <span class="ml-1">{formatDateTime(reservationStart)}</span>
          <span class="ml-2 text-xs font-semibold text-primary">({getTimeFromNow(reservationStart)})</span>
        </div>
        
        {#if organizer}
          <div>
            <span class="font-medium">주최:</span>
            <span class="ml-1">{organizer}</span>
          </div>
        {/if}
        
        {#if reservationPlatform}
          <div>
            <span class="font-medium">예약 플랫폼:</span>
            <span class="ml-1">{reservationPlatform}</span>
          </div>
        {/if}
      </div>
      
      <div class="mt-3 flex space-x-2">
        <Button 
          variant={hasNotification ? "outline" : "primary"} 
          size="sm" 
          fullWidth={true}
          onClick={onNotifyClick}
        >
          {hasNotification ? '알림 해제' : '알림 설정'}
        </Button>
        
        {#if reservationLink}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(reservationLink, '_blank')}
          >
            예약 페이지
          </Button>
        {/if}
      </div>
    </div>
  </div>
</Card> 