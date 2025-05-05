<script lang="ts">
  export let padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  export let shadow: 'none' | 'sm' | 'md' | 'lg' = 'md';
  export let border = false;
  export let rounded: 'none' | 'sm' | 'md' | 'lg' | 'full' = 'md';
  export let onClick: (() => void) | undefined = undefined;
  export let hover = false;
  export let className: string = '';

  // 카드 클래스 계산
  const getCardClasses = () => {
    const baseClasses = 'bg-white';
    
    // 패딩 설정
    const paddingClasses = {
      none: 'p-0',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6'
    };
    
    // 그림자 설정
    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-card',
      lg: 'shadow-lg'
    };
    
    // 테두리 설정
    const borderClass = border ? 'border border-neutral-200' : '';
    
    // 모서리 설정
    const roundedClasses = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full'
    };
    
    // 호버 효과
    const hoverClass = hover ? 'hover:shadow-lg transition-shadow cursor-pointer' : '';
    
    return `${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${borderClass} ${roundedClasses[rounded]} ${hoverClass} ${className}`;
  };
</script>

{#if onClick}
  <div 
    class={getCardClasses()} 
    on:click={onClick} 
    on:keydown={(e) => e.key === 'Enter' && onClick && onClick()}
    role="button"
    tabindex="0"
  >
    <slot />
  </div>
{:else}
  <div class={getCardClasses()}>
    <slot />
  </div>
{/if} 