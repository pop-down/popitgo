<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '../stores/auth';
  import Button from '../components/ui/Button.svelte';
  import Card from '../components/ui/Card.svelte';
  
  let isProcessing = true;
  let error: string | null = null;
  let success = false;
  
  function redirectToHome() {
    window.location.href = '/';
  }
  
  function redirectToLogin() {
    window.location.href = '/login';
  }
  
  onMount(async () => {
    try {
      // URL에서 인증 코드 추출
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);
      
      // 액세스 토큰이 있는 경우 (OAuth 리다이렉션)
      if (hashParams.has('access_token') || queryParams.has('code')) {
        // 인증 상태 새로고침
        await authStore.refresh();
        
        success = true;
        setTimeout(() => {
          redirectToHome();
        }, 2000);
      } else {
        throw new Error('인증 데이터를 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('인증 콜백 처리 중 오류 발생:', err);
      error = err instanceof Error ? err.message : '인증 처리 중 오류가 발생했습니다.';
    } finally {
      isProcessing = false;
    }
  });
</script>

<div class="container-app py-8">
  <Card className="max-w-md mx-auto">
    {#if isProcessing}
      <div class="text-center p-6">
        <div class="spinner mb-4"></div>
        <h2 class="text-xl font-semibold mb-2">로그인 처리 중...</h2>
        <p class="text-neutral-600">잠시만 기다려주세요.</p>
      </div>
    {:else if error}
      <div class="text-center p-6">
        <div class="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold mb-2">로그인 오류</h2>
        <p class="text-neutral-600 mb-4">{error}</p>
        <Button variant="outline" on:click={redirectToLogin}>다시 시도</Button>
      </div>
    {:else if success}
      <div class="text-center p-6">
        <div class="text-green-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold mb-2">로그인 성공!</h2>
        <p class="text-neutral-600 mb-4">잠시 후 홈 페이지로 이동합니다.</p>
      </div>
    {/if}
  </Card>
</div> 