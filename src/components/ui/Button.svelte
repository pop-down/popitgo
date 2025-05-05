<script lang="ts">
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let variant: 'primary' | 'secondary' | 'outline' | 'text' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled = false;
  export let fullWidth = false;
  export let onClick: (() => void) | undefined = undefined;

  // 버튼 클래스 계산
  const getButtonClasses = () => {
    const baseClasses = 'font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    // 색상 변형
    const variantClasses = {
      primary: 'bg-[--primary] text-white hover:bg-blue-600 focus:ring-blue-500',
      secondary: 'bg-[--secondary] text-white hover:bg-green-600 focus:ring-green-500',
      outline: 'bg-transparent border border-gray-300 text-[--neutral-700] hover:bg-gray-50 focus:ring-[--primary]',
      text: 'bg-transparent text-[--primary] hover:bg-gray-50 focus:ring-[--primary]'
    };
    
    // 크기 변형
    const sizeClasses = {
      sm: 'py-1 px-2 text-sm',
      md: 'py-2 px-4 text-base',
      lg: 'py-3 px-6 text-lg'
    };
    
    // 너비 설정
    const widthClass = fullWidth ? 'w-full' : '';
    
    // 비활성화 상태
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass}`;
  };
</script>

<button
  type={type}
  class={getButtonClasses()}
  on:click={onClick}
  {disabled}
  on:click
>
  <slot />
</button> 