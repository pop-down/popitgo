<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '@stores/auth';
  import Button from '@components/ui/Button.svelte';
  import { User, Home, Download, LogOut, LogIn } from 'lucide-svelte';
  
  let isAppInstalled = false;
  let deferredPrompt: any = null;
  let isAuthenticated = false;
  let username = '';
  let isLoading = true;
  
  // PWA 설치 이벤트 처리
  onMount(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
    });
    
    window.addEventListener('appinstalled', () => {
      isAppInstalled = true;
      deferredPrompt = null;
    });
    
    // 앱이 이미 설치되었는지 확인
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isAppInstalled = true;
    }
    
    // 인증 상태 확인
    const unsubscribe = authStore.subscribe(state => {
      isAuthenticated = state.isLoggedIn;
      username = state.user?.email || '';
      isLoading = state.isLoading;
    });
    
    return () => {
      unsubscribe();
    };
  });
  
  // 앱 설치
  async function installApp() {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    deferredPrompt = null;
    
    if (outcome === 'accepted') {
      isAppInstalled = true;
    }
  }
  
  // 로고 클릭 시 홈으로 이동
  function goToHome() {
    window.location.href = '/';
  }
  
  // 로그인 페이지로 이동
  function goToLogin() {
    window.location.href = '/login';
  }
  
  // 로그아웃
  function logout() {
    authStore.logout();
    window.location.href = '/';
  }
</script>

<header class="bg-white border-b border-gray-200 py-3 mb-6">
  <div class="container-app flex justify-between items-center">
    <div class="logo cursor-pointer" on:click={goToHome} on:keydown={(e) => e.key === 'Enter' && goToHome()} tabindex="0" role="button">
      <h1 class="text-xl font-bold text-blue-600">PopItGo</h1>
    </div>
    
    <div class="flex items-center gap-3">
      {#if !isAppInstalled && deferredPrompt}
        <Button variant="outline" size="sm" onClick={installApp}>
          <Download size={16} class="mr-1" />
          앱 설치
        </Button>
      {/if}
      
      {#if isAuthenticated}
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut size={16} class="mr-1" />
          로그아웃
        </Button>
      {:else}
        <Button variant="outline" size="sm" onClick={goToLogin}>
          <LogIn size={16} class="mr-1" />
          로그인
        </Button>
      {/if}
    </div>
  </div>
</header>

<style>
  .app-header {
    background-color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .logo {
    font-weight: bold;
    font-size: 1.2rem;
    color: #333;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  
  .main-nav {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    color: #666;
    text-decoration: none;
    font-size: 0.9rem;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 0.25rem;
    transition: all 0.2s ease;
  }
  
  .nav-link:hover {
    color: var(--primary);
    background-color: rgba(59, 130, 246, 0.05);
  }
  
  .loading-indicator {
    font-size: 0.85rem;
    color: #777;
  }
  
  .user-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .username {
    font-size: 0.9rem;
    color: #555;
  }
  
  .login-button {
    color: var(--primary);
    font-weight: 500;
  }
  
  .logout-button {
    color: #f44336;
  }
</style> 