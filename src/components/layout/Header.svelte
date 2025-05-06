<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '@stores/auth';
  import { User, Home, Download, LogOut, LogIn } from 'lucide-svelte';
  
  let isAppInstalled = false;
  let deferredPrompt: any = null;
  let isAuthenticated = false;
  let username = '';
  let isLoading = true;
  let isLoginPage = false;
  
  // 현재 페이지가 로그인 페이지인지 확인하는 함수
  function checkIsLoginPage() {
    isLoginPage = window.location.pathname === '/login';
  }
  
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

    // 초기 페이지 확인
    checkIsLoginPage();
    
    // 페이지 이동 감지
    const handleLocationChange = () => {
      checkIsLoginPage();
    };
    
    // 주기적으로 페이지 상태 확인
    const intervalId = setInterval(handleLocationChange, 100);
    
    return () => {
      unsubscribe();
      clearInterval(intervalId);
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
        <button class="p-2 hover:bg-gray-100 rounded-full transition-colors" on:click={installApp} aria-label="앱 설치">
          <Download size={20} class="text-gray-600" />
        </button>
      {/if}
      
      {#if !isLoading}
        {#if !isLoginPage}
          {#if isAuthenticated}
            <button 
              class="p-2 hover:bg-gray-100 rounded-full transition-colors" 
              on:click={logout}
              aria-label="로그아웃"
            >
              <LogOut size={20} class="text-gray-600" />
            </button>
          {:else}
            <button 
              class="p-2 hover:bg-gray-100 rounded-full transition-colors" 
              on:click={goToLogin}
              aria-label="로그인"
            >
              <LogIn size={20} class="text-gray-600" />
            </button>
          {/if}
        {/if}
      {/if}
    </div>
  </div>
</header>

<style>
  /* .app-header {
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
   */
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
/*   
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
  } */
</style> 