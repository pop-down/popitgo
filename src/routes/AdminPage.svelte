<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '../stores/auth';
  import { supabase } from '../services/supabase';
  import { navigate } from 'svelte-routing';
  
  // 상태 변수들
  let isAdmin = false;
  let adminRole = '';
  let isLoading = true;
  let activeTab = 'users';
  
  // 데이터 변수들
  let users: any[] = [];
  let events: any[] = [];
  let categories: any[] = [];
  let adminLogs: any[] = [];
  
  // 홈 페이지로 리다이렉트
  function redirectToHome() {
    window.location.href = '/';
  }
  
  // 로그인 페이지로 리다이렉트 (관리자 로그인 옵션 제공)
  function redirectToLogin() {
    window.location.href = '/admin';
  }
  
  // 페이지 로드 시 관리자 권한 확인
  onMount(async () => {
    // 로그인 상태 확인
    if (!$authStore.isLoggedIn) {
      // 미로그인 상태면 동일한 URL(/admin)의 로그인 페이지로 이동
      // LoginPage에서 현재 경로가 /admin이면 구글 로그인 옵션도 표시함
      window.location.href = '/login?return_to=admin';
      return;
    }
    
    // 관리자 권한 확인
    const { isAdmin: hasAccess, role } = await authStore.checkAdminAccess();
    
    if (!hasAccess) {
      // 권한이 없으면 홈으로 리디렉션
      alert('관리자 권한이 필요합니다.');
      redirectToHome();
      return;
    }
    
    // 관리자 권한이 있으면 페이지 표시
    isAdmin = hasAccess;
    adminRole = role || ''; // role이 undefined일 경우 빈 문자열로 설정
    isLoading = false;
    
    // 기본 탭 데이터 로드
    loadUsers();
  });
  
  // 사용자 목록 로드
  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from('resv_profiles')
        .select('id, username, full_name, email, role, created_at')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      users = data;
    } catch (error) {
      console.error('사용자 목록 로드 중 오류:', error);
      alert('사용자 목록을 불러오는데 실패했습니다.');
    }
  }
  
  // 이벤트 목록 로드
  async function loadEvents() {
    try {
      const { data, error } = await supabase
        .from('resv_events')
        .select(`
          id, title, description, organizer, category, 
          reservation_start, reservation_platform, 
          user_id, profiles:resv_profiles(username, email)
        `)
        .order('reservation_start', { ascending: false });
        
      if (error) throw error;
      events = data;
    } catch (error) {
      console.error('이벤트 목록 로드 중 오류:', error);
      alert('이벤트 목록을 불러오는데 실패했습니다.');
    }
  }
  
  // 카테고리 목록 로드
  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from('resv_categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      categories = data;
    } catch (error) {
      console.error('카테고리 목록 로드 중 오류:', error);
      alert('카테고리 목록을 불러오는데 실패했습니다.');
    }
  }
  
  // 관리자 로그 로드
  async function loadAdminLogs() {
    try {
      const { data, error } = await supabase
        .from('resv_admin_logs')
        .select(`
          id, action_type, table_name, record_id, 
          details, ip_address, created_at,
          admin:resv_profiles(username, email)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      adminLogs = data;
    } catch (error) {
      console.error('관리자 로그 로드 중 오류:', error);
      alert('관리자 로그를 불러오는데 실패했습니다.');
    }
  }
  
  // 탭 변경 처리
  function changeTab(tab: string) {
    activeTab = tab;
    
    // 선택한 탭에 따라 데이터 로드
    if (tab === 'users') {
      loadUsers();
    } else if (tab === 'events') {
      loadEvents();
    } else if (tab === 'categories') {
      loadCategories();
    } else if (tab === 'logs') {
      loadAdminLogs();
    }
  }
  
  // 사용자 역할 변경
  async function changeUserRole(userId: any, newRole: any) {
    try {
      const { error } = await supabase
        .from('resv_profiles')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (error) throw error;
      
      // 로그 기록
      await logAdminAction('update', 'resv_profiles', userId, { 
        changed_fields: ['role'],
        new_values: { role: newRole }
      });
      
      // 목록 새로고침
      loadUsers();
      alert('사용자 역할이 변경되었습니다.');
    } catch (error) {
      console.error('사용자 역할 변경 중 오류:', error);
      alert('사용자 역할 변경에 실패했습니다.');
    }
  }
  
  // 카테고리 추가
  let newCategoryName = '';
  async function addCategory() {
    if (!newCategoryName.trim()) {
      alert('카테고리 이름을 입력해주세요.');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('resv_categories')
        .insert({ name: newCategoryName.trim() })
        .select();
        
      if (error) throw error;
      
      // 로그 기록
      await logAdminAction('create', 'resv_categories', data[0].id, {
        new_values: { name: newCategoryName.trim() }
      });
      
      // 목록 새로고침 및 입력창 초기화
      newCategoryName = '';
      loadCategories();
      alert('카테고리가 추가되었습니다.');
    } catch (error) {
      console.error('카테고리 추가 중 오류:', error);
      alert('카테고리 추가에 실패했습니다.');
    }
  }
  
  // 카테고리 삭제
  async function deleteCategory(categoryId: any) {
    if (!confirm('정말 이 카테고리를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('resv_categories')
        .delete()
        .eq('id', categoryId);
        
      if (error) throw error;
      
      // 로그 기록
      await logAdminAction('delete', 'resv_categories', categoryId);
      
      // 목록 새로고침
      loadCategories();
      alert('카테고리가 삭제되었습니다.');
    } catch (error) {
      console.error('카테고리 삭제 중 오류:', error);
      alert('카테고리 삭제에 실패했습니다.');
    }
  }
  
  // 관리자 활동 로깅
  async function logAdminAction(actionType: string, tableName: string, recordId: any, details = {}) {
    try {
      const user = await authStore.refresh();
      
      await supabase
        .from('resv_admin_logs')
        .insert({
          admin_id: $authStore?.user?.id,
          action_type: actionType,
          table_name: tableName,
          record_id: recordId,
          details,
          ip_address: '127.0.0.1' // 클라이언트에서는 실제 IP를 알 수 없으므로 더미 값 사용
        });
    } catch (error) {
      console.error('관리자 활동 로깅 중 오류:', error);
    }
  }
  
  // 날짜 포맷팅 함수
  function formatDate(dateString: string | number | Date) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  }
</script>

<div class="container mx-auto px-4 py-8">
  {#if isLoading}
    <div class="flex justify-center items-center h-64">
      <div class="text-xl font-semibold">로딩 중...</div>
    </div>
  {:else if isAdmin}
    <div class="mb-8">
      <h1 class="text-3xl font-bold">관리자 대시보드</h1>
      <p class="text-gray-600">역할: {adminRole}</p>
    </div>
    
    <!-- 탭 네비게이션 -->
    <div class="border-b border-gray-200 mb-6">
      <ul class="flex -mb-px">
        <li class="mr-1">
          <button
            class="inline-block py-4 px-4 text-sm font-medium {activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}"
            on:click={() => changeTab('users')}
          >
            사용자 관리
          </button>
        </li>
        <li class="mr-1">
          <button
            class="inline-block py-4 px-4 text-sm font-medium {activeTab === 'events' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}"
            on:click={() => changeTab('events')}
          >
            이벤트 관리
          </button>
        </li>
        <li class="mr-1">
          <button
            class="inline-block py-4 px-4 text-sm font-medium {activeTab === 'categories' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}"
            on:click={() => changeTab('categories')}
          >
            카테고리 관리
          </button>
        </li>
        <li class="mr-1">
          <button
            class="inline-block py-4 px-4 text-sm font-medium {activeTab === 'logs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}"
            on:click={() => changeTab('logs')}
          >
            관리자 로그
          </button>
        </li>
      </ul>
    </div>
    
    <!-- 사용자 관리 탭 -->
    {#if activeTab === 'users'}
      <div>
        <h2 class="text-xl font-semibold mb-4">사용자 목록</h2>
        <div class="overflow-x-auto bg-white rounded-lg shadow">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each users as user}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      {#if user.full_name}
                        <div class="text-sm font-medium text-gray-900">{user.full_name}</div>
                        <div class="text-sm text-gray-500 ml-1">(@{user.username})</div>
                      {:else}
                        <div class="text-sm font-medium text-gray-900">@{user.username}</div>
                      {/if}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{user.email || '-'}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      {user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 
                        user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'}">
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {#if adminRole === 'super_admin' && user.id !== $authStore?.user?.id}
                      <select 
                        class="text-sm border rounded p-1"
                        on:change={(e) => changeUserRole(user.id, (e.target as HTMLSelectElement).value)}
                        value={user.role || 'user'}
                      >
                        <option value="user">일반 사용자</option>
                        <option value="admin">관리자</option>
                        <option value="super_admin">슈퍼 관리자</option>
                      </select>
                    {:else}
                      <span class="text-gray-400">변경 불가</span>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
    
    <!-- 이벤트 관리 탭 -->
    {#if activeTab === 'events'}
      <div>
        <h2 class="text-xl font-semibold mb-4">이벤트 목록</h2>
        <div class="overflow-x-auto bg-white rounded-lg shadow">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주최자</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예약시작</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등록자</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each events as event}
                <tr>
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">{event.title}</div>
                    <div class="text-xs text-gray-500">{event.description?.substring(0, 50)}...</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.organizer || '-'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {event.category || '-'}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(event.reservation_start)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{event.profiles?.username || '-'}</div>
                    <div class="text-xs text-gray-500">{event.profiles?.email || '-'}</div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
    
    <!-- 카테고리 관리 탭 -->
    {#if activeTab === 'categories'}
      <div>
        <h2 class="text-xl font-semibold mb-4">카테고리 관리</h2>
        
        <!-- 카테고리 추가 폼 -->
        <div class="mb-6 bg-white rounded-lg shadow p-4">
          <h3 class="text-lg font-medium mb-2">새 카테고리 추가</h3>
          <div class="flex">
            <input 
              type="text" 
              bind:value={newCategoryName}
              placeholder="카테고리 이름" 
              class="flex-1 rounded-l border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              on:click={addCategory}
              class="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              추가
            </button>
          </div>
        </div>
        
        <!-- 카테고리 목록 -->
        <div class="overflow-x-auto bg-white rounded-lg shadow">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성일</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each categories as category}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(category.created_at)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      on:click={() => deleteCategory(category.id)}
                      class="text-red-600 hover:text-red-900 focus:outline-none"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
    
    <!-- 관리자 로그 탭 -->
    {#if activeTab === 'logs'}
      <div>
        <h2 class="text-xl font-semibold mb-4">관리자 활동 로그</h2>
        <div class="overflow-x-auto bg-white rounded-lg shadow">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시간</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리자</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">테이블</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">세부사항</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each adminLogs as log}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(log.created_at)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{log.admin?.username || '-'}</div>
                    <div class="text-xs text-gray-500">{log.admin?.email || '-'}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      {log.action_type === 'create' ? 'bg-green-100 text-green-800' : 
                        log.action_type === 'update' ? 'bg-blue-100 text-blue-800' : 
                        'bg-red-100 text-red-800'}">
                      {log.action_type === 'create' ? '생성' : 
                        log.action_type === 'update' ? '수정' : 
                        log.action_type === 'delete' ? '삭제' : log.action_type}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.table_name}
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">
                      {#if log.details && typeof log.details === 'object'}
                        <pre class="text-xs whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                      {:else}
                        -
                      {/if}
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  {:else}
    <div class="text-center py-12">
      <h1 class="text-2xl font-bold text-red-600">접근 권한이 없습니다</h1>
      <p class="mt-2 text-gray-600">이 페이지에 접근하려면 관리자 권한이 필요합니다.</p>
      <button 
        on:click={() => navigate('/')}
        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
      >
        홈으로 돌아가기
      </button>
    </div>
  {/if}
</div> 