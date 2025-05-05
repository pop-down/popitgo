<script lang="ts">
  import Header from './components/layout/Header.svelte';
  import Footer from './components/layout/Footer.svelte';
  import EventCard from './components/features/EventCard.svelte';
  import Button from './components/ui/Button.svelte';
  import Card from './components/ui/Card.svelte';
  import EventPage from './routes/EventPage.svelte';
  
  // 샘플 이벤트 데이터
  const sampleEvents = [
    {
      id: '1',
      title: '샘플 콘서트 예약',
      description: '인기 아티스트의 콘서트 예약을 놓치지 마세요. 선착순 한정 입장권!',
      reservationStart: new Date(Date.now() + 86400000), // 내일
      reservationPlatform: '인터파크',
      reservationLink: 'https://example.com',
      category: '콘서트',
      organizer: '뮤직 엔터테인먼트',
      hasNotification: true
    },
    {
      id: '2',
      title: '인기 전시회 티켓 오픈',
      description: '한정 특별 전시회 티켓 예약이 곧 시작됩니다.',
      reservationStart: new Date(Date.now() + 86400000 * 3), // 3일 후
      reservationPlatform: '네이버',
      reservationLink: 'https://example.com',
      category: '전시회',
      organizer: '아트 재단',
      hasNotification: false
    },
    {
      id: '3',
      title: '한정판 굿즈 예약',
      description: '인기 아이돌 콘서트 한정판 굿즈 예약이 시작됩니다.',
      reservationStart: new Date(Date.now() + 86400000 * 2), // 2일 후
      reservationPlatform: '카카오',
      reservationLink: 'https://example.com',
      category: '굿즈',
      organizer: '엔터테인먼트 샵',
      hasNotification: false
    }
  ];
  
  // 알림 설정 토글
  function handleNotifyToggle(eventId: string) {
    // 실제 구현에서는 알림 설정 상태를 변경하는 로직이 필요
    console.log(`이벤트 ${eventId} 알림 설정 토글`);
  }

  // 현재 선택된 페이지
  let currentPage = 'home'; // 'home', 'events', 'profile' 등
  
  // 페이지 변경 함수
  function changePage(page: string) {
    currentPage = page;
  }
</script>

<div class="min-h-screen flex flex-col bg-gray-50">
  <Header />
  
  <main class="container-app py-6 flex-grow">
    {#if currentPage === 'home'}
      <div class="card mb-6">
        <h2 class="text-lg font-semibold mb-3">이벤트 예약 관리</h2>
        <p class="text-neutral-600">
          이벤트 예약 및 관리를 위한 PWA 애플리케이션입니다. 인기 있는 이벤트의 예약 시간을 놓치지 마세요.
        </p>
        <div class="mt-4">
          <Button variant="primary" onClick={() => changePage('events')}>이벤트 관리하기</Button>
        </div>
      </div>

      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-md font-semibold">다가오는 이벤트</h3>
          <div class="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => changePage('events')}>모두 보기</Button>
            <Button variant="outline" size="sm">필터</Button>
          </div>
        </div>
        
        <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {#each sampleEvents as event (event.id)}
            <EventCard 
              id={event.id}
              title={event.title}
              description={event.description}
              reservationStart={event.reservationStart}
              reservationPlatform={event.reservationPlatform}
              reservationLink={event.reservationLink}
              category={event.category}
              organizer={event.organizer}
              hasNotification={event.hasNotification}
              onNotifyClick={() => handleNotifyToggle(event.id)}
            />
          {/each}
        </div>
      </div>
    {:else if currentPage === 'events'}
      <EventPage />
    {/if}
  </main>
  
  <Footer />
</div>
