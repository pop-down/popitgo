<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '../stores/auth';
  import Button from '../components/ui/Button.svelte';
  import Card from '../components/ui/Card.svelte';
  import { LogIn } from 'lucide-svelte';
  
  let isLoading = false;
  let error: string | null = null;
  let isAdminLogin = false;
  let returnTo = '';
  
  // 로그인 후 리다이렉트 경로 결정
  function redirectAfterLogin() {
    // return_to 값이 있으면 그 경로로, 없으면 기본 경로로 리다이렉트
    if (returnTo === 'admin') {
      window.location.href = '/admin';
    } else {
      window.location.href = isAdminLogin ? '/admin' : '/';
    }
  }
  
  // 로그인 상태 확인
  onMount(() => {
    // URL 쿼리 파라미터에서 return_to 값 확인
    const urlParams = new URLSearchParams(window.location.search);
    returnTo = urlParams.get('return_to') || '';
    
    // 현재 경로가 /admin인지 확인
    isAdminLogin = window.location.pathname === '/admin' || returnTo === 'admin';
    
    // 이미 로그인했으면 적절한 페이지로 리다이렉트
    if ($authStore.isLoggedIn) {
      redirectAfterLogin();
    }
    
    // 인증 스토어 구독
    const unsubscribe = authStore.subscribe(state => {
      if (state.isLoggedIn) {
        redirectAfterLogin();
      }
    });
    
    return unsubscribe;
  });
  
  // 카카오 로그인 처리
  async function handleKakaoLogin() {
    try {
      isLoading = true;
      error = null;
      await authStore.login();
    } catch (err) {
      console.error('카카오 로그인 오류:', err);
      error = '로그인 중 오류가 발생했습니다.';
    } finally {
      isLoading = false;
    }
  }
  
  // 구글 로그인 처리
  async function handleGoogleLogin() {
    try {
      isLoading = true;
      error = null;
      await authStore.loginWithGoogle();
    } catch (err) {
      console.error('구글 로그인 오류:', err);
      error = '로그인 중 오류가 발생했습니다.';
    } finally {
      isLoading = false;
    }
  }
  
  // 카카오 로그인 키보드 이벤트 처리
  function handleKakaoKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleKakaoLogin();
    }
  }
  
  // 구글 로그인 키보드 이벤트 처리
  function handleGoogleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleGoogleLogin();
    }
  }
</script>

<div class="w-full max-w-md mx-auto my-12">
  <Card className="p-6">
    <h1 class="text-2xl font-semibold mb-6 text-center">
      {isAdminLogin ? '관리자 로그인' : '로그인'}
    </h1>
    
    {#if error}
      <div class="bg-red-50 text-red-700 p-3 rounded-md mb-4">
        {error}
      </div>
    {/if}
    
    <div class="flex flex-col gap-4">
      <!-- 카카오 로그인 버튼 -->
      <button
        class="flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-[#FEE500] text-[#000000] font-medium hover:bg-[#FFDE00] transition-colors w-full"
        on:click={handleKakaoLogin}
        on:keydown={handleKakaoKeyDown}
        disabled={isLoading}
        aria-label="카카오로 로그인"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C7.03 4 3 7.13 3 11C3 13.45 4.61 15.61 7 16.77V20L10.89 17.38C11.25 17.45 11.62 17.5 12 17.5C16.97 17.5 21 14.37 21 10.5C21 6.63 16.97 4 12 4Z" fill="black"/>
        </svg>
        <span>{isLoading ? '로그인 중...' : '카카오로 로그인'}</span>
      </button>
      
      <!-- 관리자 로그인인 경우 구글 로그인 버튼 추가 -->
      {#if isAdminLogin}
        <button
          class="flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors w-full"
          on:click={handleGoogleLogin}
          on:keydown={handleGoogleKeyDown}
          disabled={isLoading}
          aria-label="구글로 로그인"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4"/>
            <path d="M12.24 24.0008C15.4764 24.0008 18.2058 22.9382 20.1944 21.1039L16.3274 18.1055C15.2516 18.8375 13.8626 19.252 12.2444 19.252C9.11376 19.252 6.45934 17.1399 5.50693 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.24 24.0008Z" fill="#34A853"/>
            <path d="M5.50253 14.3003C5.00973 12.8099 5.00973 11.1961 5.50253 9.70575V6.61481H1.51641C-0.185866 10.0056 -0.185866 14.0004 1.51641 17.3912L5.50253 14.3003Z" fill="#FBBC04"/>
            <path d="M12.24 4.74966C13.9761 4.7232 15.6521 5.36697 16.8961 6.54867L20.1943 3.12814C18.0221 1.0855 15.2362 -0.034466 12.24 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50272 9.70575C6.45553 6.86173 9.10955 4.74966 12.24 4.74966Z" fill="#EA4335"/>
          </svg>
          <span>{isLoading ? '로그인 중...' : '구글로 로그인'}</span>
        </button>
      {/if}
      
      <p class="text-center text-sm text-neutral-500 mt-4">
        로그인하면 PopItGo의 <a href="/terms" class="text-primary hover:underline">이용약관</a>과 <a href="/privacy" class="text-primary hover:underline">개인정보 처리방침</a>에 동의하게 됩니다.
      </p>
    </div>
  </Card>
</div> 