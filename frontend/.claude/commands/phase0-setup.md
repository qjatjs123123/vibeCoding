# /phase0-setup — Phase 0: 프로젝트 셋업

`frontend/TODO.md`의 Phase 0 항목을 순서대로 실행합니다.

---

## 실행 절차

### 1️⃣ TODO 읽기
`frontend/TODO.md`의 Phase 0에서 첫 `[ ]` 항목을 찾습니다 (P0-1~P0-8).

### 2️⃣ 컨텍스트 파악
**참고**: `frontend/CLAUDE.md` (기술 스택 섹션)

### 3️⃣ 작업 실행

#### P0-1: Next.js 15 프로젝트 초기화
```bash
npx create-next-app@latest vibeCoding-frontend \
  --typescript \
  --tailwind \
  --app
```

#### P0-2: 주요 의존성 설치
```bash
npm install \
  @tanstack/react-query@latest \
  zustand \
  zod \
  axios \
  inversify \
  reflect-metadata \
  next-themes \
  @uiw/react-md-editor \
  react-markdown \
  remark-gfm \
  rehype-highlight \
  rehype-sanitize \
  @lukemorales/query-key-factory
```

#### P0-3: 개발 의존성 설치
```bash
npm install --save-dev \
  vitest \
  @vitest/ui \
  jsdom \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  msw \
  @playwright/test
```

#### P0-4: tsconfig.json path alias
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### P0-5: src/lib/axios.ts 기본 설정
```typescript
import axios, { AxiosInstance } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  credentials: 'include',  // 쿠키 포함
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  config => {
    // 인증 헤더 추가 (필요 시)
    return config;
  },
  error => Promise.reject(error)
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 인증 만료 처리
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### P0-6: src/di/container.ts DI 설정
```typescript
import 'reflect-metadata';
import { Container } from 'inversify';
import { axiosInstance } from '@/lib/axios';

const container = new Container();

// axios instance
container.bind('axios').toConstantValue(axiosInstance);

// repositories 바인딩 (나중에 추가)
// container.bind('PostRepository').to(PostRepository);

export default container;
```

#### P0-7: vitest.config.ts + vitest.setup.ts
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any;
```

#### P0-8: playwright.config.ts 설정
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

### 4️⃣ 검증

**프로젝트 구조:**
```bash
ls -la frontend/
# package.json, next.config.js, tsconfig.json, src/ 등 확인
```

**의존성 설치:**
```bash
npm list @tanstack/react-query
npm list vitest
```

**설정 파일:**
```bash
npx tsc --noEmit  # TypeScript 오류 없는지 확인
```

**개발 서버:**
```bash
npm run dev  # http://localhost:3000에서 앱 시작 확인
```

### 5️⃣ 체크
TODO.md에서 P0-1~P0-8을 순서대로 `[x]`로 변경합니다.

### 6️⃣ 리포트
```
✅ [완료] Phase 0: 프로젝트 셋업 (P0-1~P0-8)
  - Next.js 15 + TypeScript + Tailwind 초기화
  - 의존성 설치 완료
  - 개발 서버 정상 작동 (localhost:3000)
  - Vitest, Playwright 설정 완료
  - DI 컨테이너 초기화

➡️ [다음] POST-1: Post 도메인 레이어 구현 시작
           실행: /phase1-domain
```

---

## 환경변수 설정

`.env.local` 파일 생성:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
# 백엔드 개발 시: http://localhost:3001 등으로 변경
```

---

## 주의사항

- **Create-next-app**: 대화형 프롬프트에서 App Router, Tailwind v4 선택
- **패키지 버전**: `@tanstack/react-query@latest` (v5.x)
- **reflect-metadata**: inversify 사용을 위해 필수 (import 순서 중요)
- **개발 서버**: Phase 1부터 `npm run dev` 실행 상태 유지

---

## 완료 후

Phase 0 완료 = **모든 준비 완료** ✅

다음: `/phase1-domain` 실행 → Post 도메인 시작
