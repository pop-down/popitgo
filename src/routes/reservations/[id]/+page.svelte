<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '@services/supabase';
  import { format } from 'date-fns';
  import { ko } from 'date-fns/locale';
  import { createReservationCancelledNotification } from '@lib/notifications';
  import type { VisitReservation } from '@lib/types';
//   import { createNotification } from '../../../stores/notifications';

  let reservation: VisitReservation | null = null;
  let loading = true;
  let error: string | null = null;
  let reservationId = window.location.pathname.split('/').pop();

  async function loadReservation() {
    try {
      loading = true;
      error = null;

      const { data, error: err } = await supabase
        .rpc('get_resv_visits', {
          p_reservation_id: reservationId
        });

      if (err) throw err;
      reservation = data;
    } catch (e) {
      error = e instanceof Error ? e.message : '예약 정보를 불러오는 중 오류가 발생했습니다';
    } finally {
      loading = false;
    }
  }

  async function handleCancel() {
    if (!confirm('예약을 취소하시겠습니까?')) return;

    try {
      const { error: err } = await supabase
        .rpc('cancel_visit_reservation', {
          p_reservation_id: reservationId
        });

      if (err) throw err;

      // 예약 취소 알림 발송
      if (reservation) {
        await createReservationCancelledNotification(reservation);
      }

      await loadReservation();
    } catch (e) {
      error = e instanceof Error ? e.message : '예약을 취소하는 중 오류가 발생했습니다';
    }
  }

  onMount(() => {
    loadReservation();
  });
</script>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">예약 상세</h1>
      <a
        href="/reservations"
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        목록으로
      </a>
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
    <!-- 예약 상세 -->
    {:else if reservation}
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-lg leading-6 font-medium text-gray-900">{reservation.activity_title}</h2>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">{reservation.brand_name}</p>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
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
        </div>
        <div class="border-t border-gray-200">
          <dl>
            <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">방문 일시</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(new Date(reservation.visit_datetime), 'PPP p', { locale: ko })}
              </dd>
            </div>
            <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">방문자</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {reservation.visitor_name}
              </dd>
            </div>
            <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">연락처</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {reservation.visitor_phone}
              </dd>
            </div>
            <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">이메일</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {reservation.visitor_email}
              </dd>
            </div>
            <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">예약 플랫폼</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {reservation.reservation_platform}
              </dd>
            </div>
            {#if reservation.reservation_url}
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">예약 URL</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <a
                    href={reservation.reservation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-600 hover:text-blue-800"
                  >
                    {reservation.reservation_url}
                  </a>
                </dd>
              </div>
            {/if}
            {#if reservation.notes}
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">메모</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {reservation.notes}
                </dd>
              </div>
            {/if}
          </dl>
        </div>
        {#if reservation.status === 'pending'}
          <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              on:click={handleCancel}
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              예약 취소
            </button>
          </div>
        {/if}
      </div>
    {:else}
      <div class="text-center py-8 text-gray-500">
        예약을 찾을 수 없습니다.
      </div>
    {/if}
  </div>
</div> 