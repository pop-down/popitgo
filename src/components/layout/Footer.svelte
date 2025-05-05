<script lang="ts">
  import { APP_NAME, APP_VERSION } from '../../lib/constants/app';
  
  const currentYear = new Date().getFullYear();
</script>

<footer class="bg-white border-t border-neutral-200 py-4 mt-auto">
  <div class="container-app">
    <div class="flex flex-col md:flex-row justify-between items-center">
      <p class="text-sm text-center text-neutral-500">
        &copy; {currentYear} {APP_NAME} - 이벤트 예약 관리 애플리케이션
      </p>
      
      <div class="flex space-x-4 mt-2 md:mt-0">
        <a href="/about" class="text-sm text-neutral-500 hover:text-primary">서비스 소개</a>
        <a href="/privacy" class="text-sm text-neutral-500 hover:text-primary">개인정보처리방침</a>
        <a href="/terms" class="text-sm text-neutral-500 hover:text-primary">이용약관</a>
      </div>
      
      <div class="text-xs text-neutral-400 mt-2 md:mt-0">v{APP_VERSION}</div>
    </div>
  </div>
</footer> 