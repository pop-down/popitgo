<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '../stores/auth';
  import Card from '../components/ui/Card.svelte';
  import Button from '../components/ui/Button.svelte';
  import { Bell, Moon, Globe, User, Shield, LogOut, ChevronRight } from 'lucide-svelte';
  
  // 설정 데이터
  let isLoading = false;
  let error: string | null = null;
  let darkMode = false;
  let language = 'ko';
  let pushNotifications = true;
  let emailNotifications = false;
  let notificationTimeOptions = [
    { value: '5', label: '5분 전' },
    { value: '10', label: '10분 전' },
    { value: '15', label: '15분 전' },
    { value: '30', label: '30분 전' },
    { value: '60', label: '1시간 전' },
    { value: '120', label: '2시간 전' },
    { value: '1440', label: '하루 전' }
  ];
  let defaultNotificationTime = '30';
  
  // 방문 예정 시간 설정
  let defaultVisitTime = '30'; // 이벤트 시작 30분 전
  let visitTimeOptions = [
    { value: '0', label: '이벤트 시작 시간' },
    { value: '15', label: '15분 전' },
    { value: '30', label: '30분 전' },
    { value: '60', label: '1시간 전' } 
  ];
  
  onMount(async () => {
    // 설정 데이터 로드
    loadSettings();
    
    // 시스템 다크모드 감지
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    darkMode = localStorage.getItem('darkMode') === 'true' || (localStorage.getItem('darkMode') === null && prefersDark);
    
    // 다크모드 설정 적용
    applyTheme();
  });
  
  // 설정 데이터 로드
  async function loadSettings() {
    if (!$authStore.isLoggedIn) return;
    
    isLoading = true;
    error = null;
    
    try {
      // 여기서 실제 API 호출로 사용자 설정을 가져와야 함
      // 지금은 임시 데이터
      language = localStorage.getItem('language') || 'ko';
      pushNotifications = localStorage.getItem('pushNotifications') !== 'false';
      emailNotifications = localStorage.getItem('emailNotifications') === 'true';
      defaultNotificationTime = localStorage.getItem('defaultNotificationTime') || '30';
      defaultVisitTime = localStorage.getItem('defaultVisitTime') || '30';
    } catch (err) {
      console.error('설정 로드 중 오류 발생:', err);
      error = '설정을 불러올 수 없습니다.';
    } finally {
      isLoading = false;
    }
  }
  
  // 설정 저장
  async function saveSettings() {
    isLoading = true;
    error = null;
    
    try {
      // 다크모드 설정 저장
      localStorage.setItem('darkMode', darkMode.toString());
      
      // 언어 설정 저장
      localStorage.setItem('language', language);
      
      // 알림 설정 저장
      localStorage.setItem('pushNotifications', pushNotifications.toString());
      localStorage.setItem('emailNotifications', emailNotifications.toString());
      localStorage.setItem('defaultNotificationTime', defaultNotificationTime);
      localStorage.setItem('defaultVisitTime', defaultVisitTime);
      
      // 테마 적용
      applyTheme();
      
      // 실제 서버에 설정 저장하는 API 호출이 필요함
      alert('설정이 저장되었습니다.');
    } catch (err) {
      console.error('설정 저장 중 오류 발생:', err);
      error = '설정을 저장할 수 없습니다.';
    } finally {
      isLoading = false;
    }
  }
  
  // 테마 적용
  function applyTheme() {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  
  // 로그아웃
  function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
      authStore.logout();
      window.location.href = '/';
    }
  }
  
  // 프로필 편집 페이지로 이동
  function goToProfileEdit() {
    // 프로필 편집 페이지 구현 필요
    alert('프로필 편집 기능은 개발 중입니다.');
  }
  
  // 비밀번호 변경 페이지로 이동
  function goToPasswordChange() {
    // 비밀번호 변경 페이지 구현 필요
    alert('비밀번호 변경 기능은 개발 중입니다.');
  }
  
  // 개인정보 설정 페이지로 이동
  function goToPrivacySettings() {
    // 개인정보 설정 페이지 구현 필요
    alert('개인정보 설정 기능은 개발 중입니다.');
  }
</script>

<div class="settings-page">
  <!-- <h1 class="page-title">설정</h1> -->
  
  {#if error}
    <div class="error-message">{error}</div>
  {/if}
  
  <section class="settings-section">
    <h2 class="section-title">
      <User size={18} /> 프로필 및 계정
    </h2>
    <Card>
      {#if $authStore.isLoggedIn}
        <div class="setting-item clickable" on:click={goToProfileEdit} on:keydown={(e) => e.key === 'Enter' && goToProfileEdit()} tabindex="0" role="button">
          <div class="setting-info">
            <h3>프로필 정보 편집</h3>
            <p>사용자 정보를 변경합니다.</p>
          </div>
          <ChevronRight size={18} />
        </div>
        
        <!-- <div class="setting-item clickable" on:click={goToPasswordChange} on:keydown={(e) => e.key === 'Enter' && goToPasswordChange()} tabindex="0" role="button">
          <div class="setting-info">
            <h3>비밀번호 변경</h3>
            <p>계정 비밀번호를 변경합니다.</p>
          </div>
          <ChevronRight size={18} />
        </div> -->
        
        <!-- <div class="setting-item clickable" on:click={goToPrivacySettings} on:keydown={(e) => e.key === 'Enter' && goToPrivacySettings()} tabindex="0" role="button">
          <div class="setting-info">
            <h3>개인정보 설정</h3>
            <p>개인정보 공개 범위 및 관리 설정</p>
          </div>
          <ChevronRight size={18} />
        </div> -->
        
        <div class="setting-item logout" on:click={handleLogout} on:keydown={(e) => e.key === 'Enter' && handleLogout()} tabindex="0" role="button">
          <div class="setting-info">
            <h3>로그아웃</h3>
            <p>계정에서 로그아웃합니다.</p>
          </div>
          <LogOut size={18} />
        </div>
      {:else}
        <div class="login-prompt">
          <p>설정을 관리하려면 로그인하세요.</p>
          <Button variant="primary" onClick={() => window.location.href = '/login'}>로그인</Button>
        </div>
      {/if}
    </Card>
  </section>
  
  <section class="settings-section">
    <h2 class="section-title">
      <Bell size={18} /> 알림 설정
    </h2>
    <Card>
      <div class="setting-item">
        <div class="setting-info">
          <h3>푸시 알림</h3>
          <p>브라우저 또는 앱 푸시 알림을 받습니다.</p>
        </div>
        <label class="toggle">
          <input type="checkbox" bind:checked={pushNotifications}>
          <span class="toggle-slider"></span>
        </label>
      </div>
      
      <div class="setting-item">
        <div class="setting-info">
          <h3>이메일 알림</h3>
          <p>이메일로 알림을 받습니다.</p>
        </div>
        <label class="toggle">
          <input type="checkbox" bind:checked={emailNotifications}>
          <span class="toggle-slider"></span>
        </label>
      </div>
      
      <div class="setting-item">
        <div class="setting-info">
          <h3>기본 알림 시간</h3>
          <p>예약 시작 전 알림을 받을 기본 시간입니다.</p>
        </div>
        <select bind:value={defaultNotificationTime} class="select-input">
          {#each notificationTimeOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
      
      <div class="setting-item">
        <div class="setting-info">
          <h3>방문 시간 설정</h3>
          <p>이벤트 시작 기준 방문 예정 시간입니다.</p>
        </div>
        <select bind:value={defaultVisitTime} class="select-input">
          {#each visitTimeOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
    </Card>
  </section>
  
  <section class="settings-section">
    <h2 class="section-title">
      <Moon size={18} /> 테마 및 표시
    </h2>
    <Card>
      <div class="setting-item">
        <div class="setting-info">
          <h3>다크 모드</h3>
          <p>어두운 테마로 표시합니다.</p>
        </div>
        <label class="toggle">
          <input type="checkbox" bind:checked={darkMode}>
          <span class="toggle-slider"></span>
        </label>
      </div>
      
      <div class="setting-item">
        <div class="setting-info">
          <h3>언어</h3>
          <p>앱 표시 언어를 선택합니다.</p>
        </div>
        <select bind:value={language} class="select-input">
          <option value="ko">한국어</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="zh">中文</option>
        </select>
      </div>
    </Card>
  </section>
  
  <section class="settings-section about">
    <h2 class="section-title">
      <Shield size={18} /> 정보
    </h2>
    <Card>
      <div class="about-info">
        <h3>PopItGo v0.1.0</h3>
        <p>이벤트 예약 알림 서비스</p>
        <div class="links">
          <a href="#" class="link">개인정보처리방침</a>
          <a href="#" class="link">서비스 이용약관</a>
          <a href="#" class="link">오픈소스 라이선스</a>
        </div>
      </div>
    </Card>
  </section>
  
  <div class="button-container">
    <Button variant="primary" onClick={saveSettings} disabled={isLoading}>
      {isLoading ? '저장 중...' : '설정 저장'}
    </Button>
  </div>
</div>

<style>
  .settings-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .settings-section {
    margin-bottom: 2rem;
  }
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: #555;
  }
  
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid #eee;
  }
  
  .setting-item:last-child {
    border-bottom: none;
  }
  
  .setting-info h3 {
    font-size: 1rem;
    font-weight: 500;
    margin: 0 0 0.25rem 0;
  }
  
  .setting-info p {
    font-size: 0.85rem;
    color: #666;
    margin: 0;
  }
  
  .select-input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    background-color: white;
    min-width: 120px;
  }
  
  .clickable {
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .clickable:hover {
    background-color: #f5f5f5;
  }
  
  .logout {
    color: #e53e3e;
  }
  
  .toggle {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
  }
  
  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 24px;
  }
  
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
  
  input:checked + .toggle-slider {
    background-color: var(--primary);
  }
  
  input:checked + .toggle-slider:before {
    transform: translateX(26px);
  }
  
  .error-message {
    background-color: #fee2e2;
    color: #ef4444;
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }
  
  .button-container {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
    margin-bottom: 3rem;
  }
  
  .login-prompt {
    text-align: center;
    padding: 1.5rem 0;
  }
  
  .login-prompt p {
    margin-bottom: 1rem;
    color: #666;
  }
  
  .about-info {
    text-align: center;
    padding: 1rem 0;
  }
  
  .about-info h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .about-info p {
    color: #666;
    margin-bottom: 1rem;
  }
  
  .links {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .link {
    color: var(--primary);
    font-size: 0.85rem;
    text-decoration: none;
  }
  
  .link:hover {
    text-decoration: underline;
  }
</style> 