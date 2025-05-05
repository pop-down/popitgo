# PopItGo - 이벤트 예약 관리 PWA

이 프로젝트는 사용자가 다양한 이벤트의 예약 시간을 관리하고 알림을 받을 수 있는 PWA(Progressive Web App) 애플리케이션입니다.

## 주요 기능

- 이벤트 예약 일정 관리
- 예약 시작 시간 알림 설정
- 다양한 예약 플랫폼 지원
- 오프라인 모드 지원 (PWA)
- 모바일 앱처럼 설치 가능

## 기술 스택

- Svelte + Vite
- TypeScript
- Tailwind CSS
- Supabase (인증 및 데이터베이스)
- PWA (Progressive Web App)

## 개발 환경 설정

### 필수 요구사항

- Node.js 16 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 프로젝트 클론
git clone https://github.com/yourusername/popitgo.git
cd popitgo

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성하고 다음 변수를 설정하세요:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 폴더 구조

```
popitgo/
├── public/             # 정적 파일 (아이콘, 매니페스트 등)
├── src/
│   ├── components/     # UI 컴포넌트
│   │   ├── ui/         # 기본 UI 요소
│   │   ├── layout/     # 레이아웃 컴포넌트
│   │   └── features/   # 기능별 컴포넌트
│   ├── lib/            # 유틸리티 및 공통 함수
│   │   ├── utils/      # 유틸리티 함수
│   │   └── constants/  # 상수 값 정의
│   ├── routes/         # 페이지 라우팅
│   ├── services/       # API 및 서비스
│   ├── stores/         # 상태 관리
│   ├── App.svelte      # 루트 컴포넌트
│   └── main.ts         # 앱 진입점
└── ...
```

## 빌드 및 배포

```bash
# 프로덕션용 빌드
npm run build

# 빌드된 앱 미리보기
npm run preview
```

## 라이센스

MIT

## 기여 방법

1. 이 저장소를 포크합니다.
2. 새 기능 브랜치를 생성합니다: `git checkout -b feature/amazing-feature`
3. 변경사항을 커밋합니다: `git commit -m 'Add some amazing feature'`
4. 브랜치에 푸시합니다: `git push origin feature/amazing-feature`
5. Pull Request를 보내주세요.
