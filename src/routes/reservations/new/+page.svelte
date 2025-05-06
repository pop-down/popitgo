<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '../../services/supabase';
  import type { BoothActivity } from '../../lib/types';
  import { format } from 'date-fns';
  import { ko } from 'date-fns/locale';
  import { createReservationCreatedNotification } from '../../lib/notifications';

  let activities: BoothActivity[] = [];
  let loading = true;
  let error: string | null = null;
  let formData = {
    booth_activity_id: '',
    visit_datetime: '',
    visitor_name: '',
    visitor_email: '',
    visitor_phone: '',
    reservation_platform: '',
    reservation_url: '',
    notes: ''
  };

  async function loadActivities() {
    try {
      loading = true;
      error = null;

      const { data, error: err } = await supabase
        .from('booth_activities')
        .select('*')
        .eq('is_reservation_available', true)
        .order('start_date', { ascending: true });

      if (err) throw err;
      activities = data;
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function handleSubmit() {
    try {
      const { data, error: err } = await supabase
        .rpc('create_visit_reservation', {
          p_booth_activity_id: formData.booth_activity_id,
          p_visit_datetime: formData.visit_datetime,
          p_visitor_name: formData.visitor_name,
          p_visitor_email: formData.visitor_email,
          p_visitor_phone: formData.visitor_phone,
          p_reservation_platform: formData.reservation_platform,
          p_reservation_url: formData.reservation_url,
          p_notes: formData.notes
        });

      if (err) throw err;

      // 예약 생성 알림 발송
      await createReservationCreatedNotification(data);

      // 목록 페이지로 이동
      window.location.href = '/reservations';
    } catch (e) {
      error = e.message;
    }
  }

  onMount(() => {
    loadActivities();
  });
</script>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">새 예약</h1>
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
    <!-- 예약 폼 -->
    {:else}
      <form on:submit|preventDefault={handleSubmit} class="space-y-6 bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="grid grid-cols-6 gap-6">
            <div class="col-span-6 sm:col-span-3">
              <label for="booth_activity" class="block text-sm font-medium text-gray-700">부스 활동</label>
              <select
                id="booth_activity"
                bind:value={formData.booth_activity_id}
                required
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">선택하세요</option>
                {#each activities as activity}
                  <option value={activity.id}>
                    {activity.title} ({format(new Date(activity.start_date), 'PPP', { locale: ko })})
                  </option>
                {/each}
              </select>
            </div>

            <div class="col-span-6 sm:col-span-3">
              <label for="visit_datetime" class="block text-sm font-medium text-gray-700">방문 일시</label>
              <input
                type="datetime-local"
                id="visit_datetime"
                bind:value={formData.visit_datetime}
                required
                class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div class="col-span-6 sm:col-span-3">
              <label for="visitor_name" class="block text-sm font-medium text-gray-700">방문자 이름</label>
              <input
                type="text"
                id="visitor_name"
                bind:value={formData.visitor_name}
                required
                class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div class="col-span-6 sm:col-span-3">
              <label for="visitor_phone" class="block text-sm font-medium text-gray-700">연락처</label>
              <input
                type="tel"
                id="visitor_phone"
                bind:value={formData.visitor_phone}
                required
                class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div class="col-span-6">
              <label for="visitor_email" class="block text-sm font-medium text-gray-700">이메일</label>
              <input
                type="email"
                id="visitor_email"
                bind:value={formData.visitor_email}
                required
                class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div class="col-span-6 sm:col-span-3">
              <label for="reservation_platform" class="block text-sm font-medium text-gray-700">예약 플랫폼</label>
              <input
                type="text"
                id="reservation_platform"
                bind:value={formData.reservation_platform}
                required
                class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div class="col-span-6 sm:col-span-3">
              <label for="reservation_url" class="block text-sm font-medium text-gray-700">예약 URL</label>
              <input
                type="url"
                id="reservation_url"
                bind:value={formData.reservation_url}
                class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div class="col-span-6">
              <label for="notes" class="block text-sm font-medium text-gray-700">메모</label>
              <textarea
                id="notes"
                bind:value={formData.notes}
                rows="3"
                class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              ></textarea>
            </div>
          </div>
        </div>
        <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="submit"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            예약하기
          </button>
        </div>
      </form>
    {/if}
  </div>
</div> 