<script lang="ts">
  import { APP_NAME, APP_VERSION } from '@lib/constants/app';
  import { Calendar, User, Settings, Home } from 'lucide-svelte';
  import { writable } from 'svelte/store';
  
  const currentYear = new Date().getFullYear();
  const activeTab = writable('home');
  
  // URL 기반으로 현재 탭 결정
  const updateActiveTab = (path: string): void => {
    if (path === '/') {
      activeTab.set('home');
    } else if (path.startsWith('/events')) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('tab') && urlParams.get('tab') === 'my-reservations') {
        activeTab.set('bookings');
      } else {
        activeTab.set('events');
      }
    } else if (path.startsWith('/settings')) {
      activeTab.set('settings');
    }
  };
  
  // 첫 로드 시 URL 기반 탭 설정
  updateActiveTab(window.location.pathname);
  
  // 탭 전환 함수
  function navigateTo(path: string, tab: string): void {
    activeTab.set(tab);
    window.location.href = path;
  }
</script>

<footer class="mt-auto bg-neutral-800 text-white py-4">
  <div class="container-app text-center text-sm">
    <p>&copy; {currentYear} {APP_NAME} v{APP_VERSION}</p>
  </div>
</footer>

<nav class="bottom-nav">
  <button 
    class:active={$activeTab === 'home'} 
    on:click={() => navigateTo('/', 'home')}
  >
    <Home size={24} />
    <span>홈</span>
  </button>
  <button 
    class:active={$activeTab === 'events'} 
    on:click={() => navigateTo('/events', 'events')}
  >
    <Calendar size={24} />
    <span>이벤트</span>
  </button>
  <button 
    class:active={$activeTab === 'bookings'} 
    on:click={() => navigateTo('/events?tab=my-reservations', 'bookings')}
  >
    <User size={24} />
    <span>예약</span>
  </button>
  <button 
    class:active={$activeTab === 'settings'} 
    on:click={() => navigateTo('/settings', 'settings')}
  >
    <Settings size={24} />
    <span>설정</span>
  </button>
</nav>

<style>
  .bottom-nav {
    display: flex;
    justify-content: space-around;
    align-items: center;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4rem;
    background-color: white;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }
  
  .bottom-nav button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 100%;
    background: none;
    border: none;
    color: #777;
    font-size: 0.75rem;
    padding: 0.5rem;
    cursor: pointer;
  }
  
  .bottom-nav button.active {
    color: var(--primary);
  }
  
  .bottom-nav button span {
    margin-top: 0.25rem;
  }
</style> 