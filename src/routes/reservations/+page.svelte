<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import type { VisitReservation } from '$lib/types';
  import { format } from 'date-fns';
  import { ko } from 'date-fns/locale';

  let reservations: VisitReservation[] = [];
  let loading = true;
  let error: string | null = null;
  let statusFilter = 'all';
  let dateRange = {
    start: '',
    end: ''
  };

  async function loadReservations() {
    try {
      loading = true;
      error = null;

      let query = supabase
        .from('visit_reservations')
        .select('*')
        .order('visit_datetime', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (dateRange.start) {
        query = query.gte('visit_datetime', dateRange.start);
      }

      if (dateRange.end) {
        query = query.lte('visit_datetime', dateRange.end);
      }

      const { data, error: err } = await query;

      if (err) throw err;
      reservations = data;
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function handleStatusFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    statusFilter = select.value;
    loadReservations();
  }

  function handleDateRangeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const { name, value } = input;
    dateRange[name] = value;
    loadReservations();
  }

  onMount(() => {
    loadReservations();
  });
</script>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-7xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">예약 목록</h1>
      <a
        href="/reservations/new"
        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        새 예약
      </a>
    </div>

    <!-- 필터 -->
    <div class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700">상태</label>
          <select
            id="status"
            value={statusFilter}
            on:change={handleStatusFilterChange}
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">전체</option>
            <option value="pending">대기중</option>
            <option value="confirmed">확정</option>
            <option value="cancelled">취소</option>
            <option value="completed">완료</option>
          </select>
        </div>

        <div>
          <label for="start_date" class="block text-sm font-medium text-gray-700">시작일</label>
          <input
            type="date"
            id="start_date"
            name="start"
            value={dateRange.start}
            on:change={handleDateRangeChange}
            class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label for="end_date" class="block text-sm font-medium text-gray-700">종료일</label>
          <input
            type="date"
            id="end_date"
            name="end"
            value={dateRange.end}
            on:change={handleDateRangeChange}
            class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>

    <!-- 로딩 상태 -->
    {#if loading}
      <div class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    <!-- 에러 상태 -->
    {:else if error}
      <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span class="block sm:inline">{error}</span>
      </div>
    <!-- 예약 목록 -->
    {:else if reservations.length > 0}
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" class="divide-y divide-gray-200">
          {#each reservations as reservation}
            <li>
              <a href="/reservations/{reservation.id}" class="block hover:bg-gray-50">
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <p class="text-sm font-medium text-blue-600 truncate">{reservation.activity_title}</p>
                      <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        {reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                         reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                         reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                         'bg-gray-100 text-gray-800'}">
                        {reservation.status === 'pending' ? '대기중' :
                         reservation.status === 'confirmed' ? '확정' :
                         reservation.status === 'cancelled' ? '취소' :
                         '완료'}
                      </span>
                    </div>
                    <div class="ml-2 flex-shrink-0 flex">
                      <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {format(new Date(reservation.visit_datetime), 'PPP p', { locale: ko })}
                      </p>
                    </div>
                  </div>
                  <div class="mt-2 sm:flex sm:justify-between">
                    <div class="sm:flex">
                      <p class="flex items-center text-sm text-gray-500">
                        {reservation.visitor_name}
                      </p>
                      <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        {reservation.visitor_phone}
                      </p>
                    </div>
                    <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        {reservation.reservation_platform}
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {:else}
      <div class="text-center py-8 text-gray-500">
        예약이 없습니다.
      </div>
    {/if}
  </div>
</div> 