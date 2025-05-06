<script lang="ts">
  import { signInWithKakao } from '@services/supabase'
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  
  export let isLoading = false;
  export let error: string | null = null;
  
  async function handleKakaoLogin() {
    try {
      isLoading = true;
      error = null;
      await signInWithKakao();
    } catch (err) {
      console.error('로그인 중 오류 발생:', err);
      if (err && typeof err === 'object' && 'message' in err) {
        error = (err as { message: string }).message;
      } else {
        error = '로그인 중 오류가 발생했습니다. 나중에 다시 시도해주세요.';
      }
    } finally {
      isLoading = false;
    }
  }
</script>

<Card padding="lg" shadow="md" className="max-w-md mx-auto">
  <div class="text-center mb-6">
    <h2 class="text-2xl font-bold text-neutral-800 mb-2">로그인</h2>
    <p class="text-neutral-600">PopItGo 서비스를 이용하려면 로그인해주세요.</p>
  </div>
  
  {#if error}
    <div class="bg-red-50 text-red-700 p-3 rounded-md mb-4">
      {error}
    </div>
  {/if}
  
  <div class="flex flex-col gap-4">
    <button
      class="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[#FEE500] text-[#000000] font-medium hover:bg-[#FFDE00] transition-colors"
      on:click={handleKakaoLogin}
      disabled={isLoading}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C7.03 4 3 7.13 3 11C3 13.45 4.61 15.61 7 16.77V20L10.89 17.38C11.25 17.45 11.62 17.5 12 17.5C16.97 17.5 21 14.37 21 10.5C21 6.63 16.97 4 12 4Z" fill="black"/>
      </svg>
      <span>{isLoading ? '로그인 중...' : '카카오로 로그인'}</span>
    </button>
    
    <p class="text-center text-sm text-neutral-500 mt-4">
      로그인하면 PopItGo의 <a href="/terms" class="text-primary hover:underline">이용약관</a>과 <a href="/privacy" class="text-primary hover:underline">개인정보 처리방침</a>에 동의하게 됩니다.
    </p>
  </div>
</Card> 