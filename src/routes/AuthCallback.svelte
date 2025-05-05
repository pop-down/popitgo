<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '../services/supabase';
  
  let error = '';
  let loading = true;
  
  onMount(async () => {
    // URL에서 해시 파라미터 처리
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    try {
      loading = true;
      
      // Supabase 인증 세션 처리
      const { data, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error('인증 세션 처리 중 오류 발생:', authError);
        error = '인증 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
        return;
      }
      
      // 성공적으로 인증되면 메인 페이지로 리디렉션
      window.location.href = '/';
    } catch (e) {
      console.error('인증 처리 중 예외 발생:', e);
      error = '인증 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
    } finally {
      loading = false;
    }
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="card max-w-md w-full p-6">
    <h1 class="text-xl font-bold text-center mb-4">인증 처리 중...</h1>
    
    {#if loading}
      <div class="flex justify-center">
        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
      <p class="text-center text-neutral-600 mt-4">인증 정보를 처리하고 있습니다. 잠시만 기다려주세요.</p>
    {:else if error}
      <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
      <div class="mt-4 text-center">
        <a href="/" class="text-primary hover:underline">홈으로 돌아가기</a>
      </div>
    {:else}
      <p class="text-center text-neutral-600">인증이 완료되었습니다. 홈 페이지로 이동합니다...</p>
    {/if}
  </div>
</div> 