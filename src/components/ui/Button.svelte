<script lang="ts">
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let variant: 'primary' | 'secondary' | 'outline' | 'text' | 'ghost' | 'icon' = 'primary';
  export let size: 'sm' | 'md' | 'lg' | 'icon' = 'md';
  export let disabled = false;
  export let fullWidth = false;
  export let onClick: ((event?: Event) => void) | undefined = undefined;
  export let className: string = '';

  // 버튼 클래스 계산
  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    // 색상 변형
    const variantClasses = {
      primary: 'bg-[#3B82F6] text-white hover:bg-[#2563EB] focus:ring-blue-500',
      secondary: 'bg-[#10B981] text-white hover:bg-[#059669] focus:ring-green-500',
      outline: 'bg-transparent border border-gray-300 text-[#374151] hover:bg-gray-50 focus:ring-[#3B82F6]',
      text: 'bg-transparent text-[#3B82F6] hover:bg-gray-50 focus:ring-[#3B82F6]',
      ghost: 'bg-transparent hover:bg-gray-100 text-[#374151]',
      icon: 'bg-transparent text-[#374151] hover:bg-gray-100 rounded-full p-1'
    };
    
    // 크기 변형
    const sizeClasses = {
      sm: 'py-1 px-2 text-sm',
      md: 'py-2 px-4 text-base',
      lg: 'py-3 px-6 text-lg',
      icon: 'h-9 w-9 p-0'
    };
    
    // 너비 설정
    const widthClass = fullWidth ? 'w-full' : 'max-w-fit';
    
    // 비활성화 상태
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`;
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