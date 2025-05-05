<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '../ui/Button.svelte';
  import { getCurrentUser, signInWithKakao, signOut } from '../../services/supabase';
  
  let isAuthenticated = false;
  let isLoading = true;
  let username = '';
  let isAppInstalled = false;
  let deferredPrompt: any = null;

  // PWA 설치 가능한지 확인
  onMount(() => {
    // PWA 설치 상태 확인
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      isAppInstalled = false;
    });

    window.addEventListener('appinstalled', () => {
      isAppInstalled = true;
      deferredPrompt = null;
    });
    
    // 사용자 인증 상태 확인
    checkAuthStatus();
  });
  
  // 사용자 인증 상태 확인
  async function checkAuthStatus() {
    isLoading = true;
    try {
      const user = await getCurrentUser();
      isAuthenticated = !!user;
      if (user?.user_metadata) {
        username = user.user_metadata.full_name || user.email || '';
      }
    } catch (error) {
      console.error('인증 상태 확인 중 오류 발생:', error);
    } finally {
      isLoading = false;
    }
  }
  
  // 로그인 처리
  async function handleLogin() {
    try {
      await signInWithKakao();
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
    }
  }
  
  // 로그아웃 처리
  async function handleLogout() {
    try {
      await signOut();
      isAuthenticated = false;
      username = '';
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  }
  
  // PWA 설치 프롬프트 표시
  function installApp() {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('사용자가 앱 설치 프롬프트를 수락했습니다.');
      } else {
        console.log('사용자가 앱 설치 프롬프트를 취소했습니다.');
      }
      deferredPrompt = null;
    });
  }
</script>

<header class="bg-white shadow-sm">
  <div class="container-app py-4">
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <a href="/" class="text-xl font-bold text-primary">PopItGo</a>
      </div>
      
      <div class="flex items-center space-x-2">
        {#if !isAppInstalled && deferredPrompt}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={installApp}
          >
            앱 설치하기
          </Button>
        {/if}
        
        {#if isLoading}
          <span class="text-sm text-neutral-500">로딩 중...</span>
        {:else if isAuthenticated}
          <div class="flex items-center space-x-2">
            <span class="text-sm">{username}님</span>
            <Button 
              variant="text" 
              size="sm" 
              onClick={handleLogout}
            >
              로그아웃
            </Button>
          </div>
        {:else}
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleLogin}
          >
            로그인
          </Button>
        {/if}
      </div>
    </div>
  </div>
</header> 