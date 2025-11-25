# LCK Manager Simulation

LCK 매니지먼트 시뮬레이션 게임

## 기술 스택

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (필요시 설치)
- **Icons**: Lucide React
- **State Management**: Zustand

## 시작하기

### 의존성 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
lolsimul/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 홈 페이지
│   └── globals.css         # 전역 스타일
├── components/             # React 컴포넌트
│   ├── layout/             # 레이아웃 컴포넌트
│   │   ├── Sidebar.tsx     # 좌측 사이드바
│   │   ├── Header.tsx      # 상단 헤더
│   │   └── Footer.tsx      # 하단 푸터
│   └── ui/                 # UI 컴포넌트
│       └── button.tsx      # 버튼 컴포넌트
├── store/                  # Zustand 스토어
│   └── gameStore.ts        # 게임 상태 관리
└── lib/                    # 유틸리티
    └── utils.ts            # 공통 유틸리티 함수
```

## Shadcn UI 컴포넌트 설치

필요한 컴포넌트를 설치하려면:

```bash
npx shadcn-ui@latest add [component-name]
```

예시:
```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
```

