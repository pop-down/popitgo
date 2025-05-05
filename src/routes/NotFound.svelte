<script>
  import Card from '../components/ui/Card.svelte';
  import Button from '../components/ui/Button.svelte';

  function goHome() {
    window.location.href = '/';
  }
</script>

<Card padding="lg" className="container-app my-12">
  <h1 class="text-xl font-bold mb-4">페이지를 찾을 수 없습니다</h1>
  <p class="mb-6">요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.</p>
  <Button variant="primary" on:click={goHome}>홈으로 돌아가기</Button>
</Card> 