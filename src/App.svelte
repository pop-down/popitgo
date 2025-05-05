<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Header from './components/layout/Header.svelte';
  import Footer from './components/layout/Footer.svelte';
  import EventPage from './routes/EventPage.svelte';
  import EventDetailPage from './routes/EventDetailPage.svelte';
  import Home from './routes/Home.svelte';
  import AuthCallback from './routes/AuthCallback.svelte';
  import LoginPage from './routes/LoginPage.svelte';
  import AdminPage from './routes/AdminPage.svelte';
  import SettingsPage from './routes/SettingsPage.svelte';
  import NotFound from './routes/NotFound.svelte';
  import { authStore, type UserInfo } from './stores/auth';
  import { writable } from 'svelte/store';
  
  // 인증 사용자 정보
  let user: UserInfo | null = null;

  // 로딩 상태
  let isLoading = true;
  
  // 현재 경로 저장할 스토어
  const currentPath = writable(window.location.pathname);
  
  // 경로별 컴포넌트 매핑 (인덱스 시그니처 추가)
  type RouteComponents = {
    [key: string]: typeof Home | typeof EventPage | typeof LoginPage | typeof AdminPage | typeof AuthCallback | typeof EventDetailPage | typeof SettingsPage | typeof NotFound;
  };
  
  const routes: RouteComponents = {
    '/': Home,
    '/events': EventPage,
    '/login': LoginPage,
    '/admin': AdminPage,
    '/auth/callback': AuthCallback,
    '/settings': SettingsPage
  };
  
  // 현재 표시할 컴포넌트
  let CurrentComponent: any = Home;
  
  // URL 이벤트 처리자
  function handlePathChange() {
    const pathname = window.location.pathname;
    currentPath.set(pathname);
    
    // 이벤트 상세 페이지 (동적 라우트)
    if (pathname.startsWith('/events/') && pathname !== '/events/') {
      const id = pathname.split('/').pop();
      CurrentComponent = EventDetailPage;
      return;
    }
    
    // 정적 라우트 매칭
    CurrentComponent = routes[pathname] || NotFound;
  }
  
  // popstate 이벤트 리스너 (뒤로 가기, 앞으로 가기)
  function handlePopState() {
    handlePathChange();
  }
  
  // 페이지 이동 함수
  function navigateTo(path: string) {
    window.history.pushState({}, '', path);
    handlePathChange();
  }
  
  // 키보드 네비게이션 핸들러
  function handleKeyNav(e: KeyboardEvent, path: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigateTo(path);
    }
  }
  
  // 인증 상태 구독
  onMount(() => {
    handlePathChange();
    
    window.addEventListener('popstate', handlePopState);
    
    // 인증 상태 구독
    const unsubscribe = authStore.subscribe(state => {
      user = state.user;
      isLoading = state.isLoading;
    });
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      unsubscribe();
    };
  });

  // 로그아웃 처리
  function handleLogout(e: MouseEvent) {
    e.preventDefault();
    authStore.logout();
  }
  
  // 로그아웃 키보드 이벤트 처리
  function handleLogoutKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      authStore.logout();
    }
  }
</script>

<div class="min-h-screen flex flex-col bg-gray-50">
  <Header />
  
  <main class="container-app py-6 pb-24 flex-grow">
    <svelte:component this={CurrentComponent} />
    
    <!-- 하단 네비게이션 바 -->
    <nav class="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-4 py-2 flex justify-around" aria-label="주요 메뉴">
      <a href="/" 
         on:click|preventDefault={() => navigateTo('/')} 
         on:keydown={(e) => handleKeyNav(e, '/')}
         class="flex flex-col items-center px-2 py-1 text-gray-600 hover:text-blue-600"
         tabindex="0"
         role="button"
         aria-label="홈"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-xs">홈</span>
      </a>
      <a href="/events" 
         on:click|preventDefault={() => navigateTo('/events')} 
         on:keydown={(e) => handleKeyNav(e, '/events')}
         class="flex flex-col items-center px-2 py-1 text-gray-600 hover:text-blue-600"
         tabindex="0"
         role="button"
         aria-label="이벤트"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-xs">이벤트</span>
      </a>
      <a href="/events?tab=my-reservations" 
         on:click|preventDefault={() => navigateTo('/events?tab=my-reservations')} 
         on:keydown={(e) => handleKeyNav(e, '/events?tab=my-reservations')}
         class="flex flex-col items-center px-2 py-1 text-gray-600 hover:text-blue-600"
         tabindex="0"
         role="button"
         aria-label="예약"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span class="text-xs">예약</span>
      </a>
      <a href="/settings" 
         on:click|preventDefault={() => navigateTo('/settings')} 
         on:keydown={(e) => handleKeyNav(e, '/settings')}
         class="flex flex-col items-center px-2 py-1 text-gray-600 hover:text-blue-600"
         tabindex="0"
         role="button"
         aria-label="설정"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="text-xs">설정</span>
      </a>
      {#if user && user.role && ['admin', 'super_admin'].includes(user.role)}
        <a href="/admin" 
           on:click|preventDefault={() => navigateTo('/admin')} 
           on:keydown={(e) => handleKeyNav(e, '/admin')}
           class="flex flex-col items-center px-2 py-1 text-gray-600 hover:text-blue-600"
           tabindex="0"
           role="button"
           aria-label="관리자"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="text-xs">관리자</span>
        </a>
      {/if}
      {#if user}
        <button
           on:click={handleLogout} 
           on:keydown={handleLogoutKeyDown}
           class="flex flex-col items-center px-2 py-1 text-gray-600 hover:text-blue-600"
           tabindex="0"
           role="button"
           aria-label="로그아웃"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="text-xs">로그아웃</span>
        </button>
      {:else}
        <a href="/login" 
           on:click|preventDefault={() => navigateTo('/login')} 
           on:keydown={(e) => handleKeyNav(e, '/login')}
           class="flex flex-col items-center px-2 py-1 text-gray-600 hover:text-blue-600"
           tabindex="0"
           role="button"
           aria-label="로그인"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="text-xs">로그인</span>
        </a>
      {/if}
    </nav>
  </main>
  
  <Footer />
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
  
  :global(body) {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f9fafb;
    color: #111827;
  }
  
  :global(.container-app) {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  :global(.card) {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    padding: 1.5rem;
  }
  
  :global(:root) {
    --primary: #3B82F6;
    --primary-dark: #2563EB;
    --secondary: #10B981;
    --secondary-dark: #059669;
    --warning: #EF4444;
    --warning-dark: #DC2626;
  }
</style>
