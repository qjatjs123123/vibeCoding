# Frontend TODO

작업 순서. 위에서부터 순서대로 진행. 완료 시 [x] 체크.

---

## Phase 0: 프로젝트 셋업

- [x] P0-1: Next.js 15 App Router 프로젝트 초기화 (TypeScript, Tailwind v4)
- [x] P0-2: 의존성 설치 (TanStack Query v5, Zustand, Zod, axios, inversify, next-themes)
- [x] P0-3: 개발 의존성 설치 (Vitest, @testing-library/react, MSW, Playwright)
- [x] P0-4: tsconfig.json path alias (@) 설정
- [x] P0-5: lib/axios.ts 기본 클라이언트 설정 (baseURL, credentials, 인터셉터)
- [x] P0-6: di/container.ts inversify DI 컨테이너 초기화
- [x] P0-7: vitest.config.ts + vitest.setup.ts 설정
- [x] P0-8: playwright.config.ts 설정

---

## Phase 1: 도메인 레이어

> 각 도메인: DTO → Zod Schema → Domain Model → Mapper → Repository Interface → Repository 구현 → MSW 테스트
> 패턴: `frontend/.claude/rules/domain-layer-pattern.md` 참고

### Post 도메인

- [x] POST-1: backend/CLAUDE.md에서 Post API 응답 스키마 확인 및 정리
- [x] POST-2: src/features/post/dto/postDto.ts 작성 (백엔드 응답 그대로 interface)
- [x] POST-3: src/features/post/dto/postSchema.ts 작성 (Zod 검증 스키마)
- [x] POST-4: src/features/post/model/post.ts 도메인 모델 작성
- [x] POST-5: src/features/post/model/postMapper.ts 작성 (DTO → Domain 변환)
- [x] POST-6: src/features/post/repository/IPostRepository.ts 인터페이스 정의
- [x] POST-7: src/features/post/repository/postRepository.ts axios 구현체 작성
- [x] POST-8: src/features/post/__tests__/postRepository.test.ts MSW mock 테스트 작성 및 통과 확인 ✅ 15/15 테스트 PASS

### User 도메인

- [x] USER-1: backend/CLAUDE.md에서 User API 응답 스키마 확인 및 정리
- [x] USER-2: src/features/user/dto/userDto.ts 작성
- [x] USER-3: src/features/user/dto/userSchema.ts 작성 (Zod)
- [x] USER-4: src/features/user/model/user.ts 도메인 모델 작성
- [x] USER-5: src/features/user/model/userMapper.ts 작성
- [x] USER-6: src/features/user/repository/IUserRepository.ts 인터페이스 정의
- [x] USER-7: src/features/user/repository/userRepository.ts 구현체 작성
- [x] USER-8: src/features/user/__tests__/userRepository.test.ts MSW mock 테스트 통과 확인 ✅ 14/14 테스트 PASS

### Comment 도메인

- [x] COMMENT-1: backend/CLAUDE.md에서 Comment API 응답 스키마 확인 및 정리
- [x] COMMENT-2: src/features/comment/dto/commentDto.ts 작성
- [x] COMMENT-3: src/features/comment/dto/commentSchema.ts 작성 (Zod)
- [x] COMMENT-4: src/features/comment/model/comment.ts 도메인 모델 작성 (soft-delete 상태 포함)
- [x] COMMENT-5: src/features/comment/model/commentMapper.ts 작성
- [x] COMMENT-6: src/features/comment/repository/ICommentRepository.ts 인터페이스 정의
- [x] COMMENT-7: src/features/comment/repository/commentRepository.ts 구현체 작성
- [x] COMMENT-8: src/features/comment/__tests__/commentRepository.test.ts MSW mock 테스트 통과 확인 ✅ 16/16 테스트 PASS

### Tag 도메인

- [x] TAG-1: backend/CLAUDE.md에서 Tag API 응답 스키마 확인 및 정리
- [x] TAG-2: src/features/tag/dto/tagDto.ts 작성
- [x] TAG-3: src/features/tag/dto/tagSchema.ts 작성 (Zod)
- [x] TAG-4: src/features/tag/model/tag.ts 도메인 모델 작성
- [x] TAG-5: src/features/tag/model/tagMapper.ts 작성
- [x] TAG-6: src/features/tag/repository/ITagRepository.ts 인터페이스 정의
- [x] TAG-7: src/features/tag/repository/tagRepository.ts 구현체 작성
- [x] TAG-8: src/features/tag/__tests__/tagRepository.test.ts MSW mock 테스트 통과 확인 ✅ 7/7 테스트 PASS

### Series 도메인

- [x] SERIES-1: backend/CLAUDE.md에서 Series API 응답 스키마 확인 및 정리
- [x] SERIES-2: src/features/series/dto/seriesDto.ts 작성
- [x] SERIES-3: src/features/series/dto/seriesSchema.ts 작성 (Zod)
- [x] SERIES-4: src/features/series/model/series.ts 도메인 모델 작성
- [x] SERIES-5: src/features/series/model/seriesMapper.ts 작성
- [x] SERIES-6: src/features/series/repository/ISeriesRepository.ts 인터페이스 정의
- [x] SERIES-7: src/features/series/repository/seriesRepository.ts 구현체 작성
- [x] SERIES-8: src/features/series/__tests__/seriesRepository.test.ts MSW mock 테스트 통과 확인 ✅ 16/16 테스트 PASS

### Upload / Search (단순 도메인)

- [x] UPLOAD-1: src/features/upload/repository/uploadRepository.ts 구현 (multipart POST) ✅ 5/5 테스트 PASS
- [x] UPLOAD-2: src/features/upload/__tests__/uploadRepository.test.ts 테스트 통과 확인
- [x] SEARCH-1: src/features/search/dto/searchDto.ts 작성 ✅ 6/6 테스트 PASS
- [x] SEARCH-2: src/features/search/repository/searchRepository.ts 구현
- [x] SEARCH-3: src/features/search/__tests__/searchRepository.test.ts 테스트 통과 확인

---

## Phase 2: State Layer (TanStack Query Hooks)

> useSuspenseQuery 사용. queryKey: @lukemorales/query-key-factory
> 테스트: Suspense wrapper + waitFor 패턴

### Setup

- [x] STATE-0: src/lib/queryKeys.ts queryKey Factory (전 도메인 queryKey 정의) ✅

### Post Domain

- [x] STATE-1: src/features/post/state/usePostQuery.ts (useSuspenseQuery: getFeedRecent, getFeedTrending, getById, getBySlug, getByTag)
- [x] STATE-2: src/features/post/state/__tests__/usePostQuery.test.tsx ✅ 6/6 테스트 PASS
- [x] STATE-3: src/features/post/state/usePostMutation.ts (useMutation: create, update, delete + toggleLike with 낙관적 업데이트)
- [x] STATE-4: src/features/post/state/__tests__/usePostMutation.test.tsx ✅ 4/4 테스트 PASS

### User Domain

- [x] STATE-5: src/features/user/state/useUserQuery.ts (useSuspenseQuery)
- [x] STATE-6: src/features/user/state/__tests__/useUserQuery.test.tsx ✅ 2/2 테스트 PASS
- [x] STATE-7: src/features/user/state/useUserMutation.ts (useMutation)
- [x] STATE-8: src/features/user/state/__tests__/useUserMutation.test.tsx ✅ 1/1 테스트 PASS

### Comment Domain

- [x] STATE-9: src/features/comment/state/useCommentQuery.ts (useSuspenseQuery)
- [x] STATE-10: src/features/comment/state/__tests__/useCommentQuery.test.tsx ✅ 1/1 테스트 PASS
- [x] STATE-11: src/features/comment/state/useCommentMutation.ts (useMutation + soft-delete 고려)
- [x] STATE-12: src/features/comment/state/__tests__/useCommentMutation.test.tsx ✅ 3/3 테스트 PASS

### Tag / Series Domain

- [x] STATE-13: src/features/tag/state/useTagQuery.ts + __tests__/useTagQuery.test.tsx ✅ 1/1 테스트 PASS
- [x] STATE-14: src/features/series/state/ (useSeriesQuery.ts, useSeriesMutation.ts + 테스트) ✅ 4/4 테스트 PASS

### Zustand Stores

- [x] STATE-15: src/stores/authStore.ts (로그인/로그아웃/세션 리셋) ✅
- [x] STATE-16: src/stores/editorStore.ts (임시저장 상태) ✅

---

## Phase 3: Feature Layer (Components + Hooks)

- [x] COMP-1: 공통 컴포넌트 (Button, Input, Avatar, Skeleton, ErrorFallback) ✅ 36/36 테스트 PASS
- [x] COMP-2: PostCard 컴포넌트 + 테스트 ✅ (dev 페이지 + 테스트 작성 완료)
- [x] COMP-3: PostList (무한스크롤 IntersectionObserver) + 테스트 ✅ (테스트 작성 완료)
- [x] COMP-4: PostDetail (Markdown 렌더링, rehype-sanitize XSS 방어) + 테스트 ✅
- [x] COMP-5: MarkdownEditor (dynamic import, 이미지 드래그앤드롭) + 테스트 ✅ Vitest 16/17 PASS + Playwright 15+ PASS
- [x] COMP-6: CommentList + CommentItem (soft-delete 표시) + 테스트 ✅ 23개 테스트 + Playwright 검증
- [x] COMP-7: CommentForm (인증 게이팅) + 테스트 ✅ 24개 테스트 케이스 작성
- [x] COMP-8: LikeButton (낙관적 업데이트 UI) + 테스트 ✅ 26개 테스트 케이스 작성
- [x] COMP-9: TagList + TagBadge + 테스트 ✅ 31개 테스트 케이스 작성
- [x] COMP-10: SeriesBox (포스트 내 시리즈 네비게이션) + 테스트 ✅ 17개 테스트 케이스 작성
- [x] COMP-11: UserProfile 컴포넌트 + 테스트 ✅ 24개 테스트 케이스 작성

---

## Phase 4: Pages (App Router)

- [ ] PAGE-1: app/layout.tsx (QueryClientProvider, ThemeProvider, AuthProvider)
- [ ] PAGE-2: app/page.tsx 메인 피드 (ISR)
- [ ] PAGE-3: app/(feed)/recent/page.tsx + trending/page.tsx
- [ ] PAGE-4: app/(auth)/login/page.tsx + register/page.tsx
- [ ] PAGE-5: app/write/page.tsx (Protected, 에디터)
- [ ] PAGE-6: app/write/[postId]/page.tsx (임시저장 이어쓰기)
- [ ] PAGE-7: app/@[username]/page.tsx 유저 프로필
- [ ] PAGE-8: app/[username]/[slug]/page.tsx 포스트 상세 (ISR)
- [ ] PAGE-9: app/tags/page.tsx + [tagName]/page.tsx
- [ ] PAGE-10: app/settings/page.tsx + profile/page.tsx (Protected)
- [ ] PAGE-11: sitemap.ts + robots.ts + JSON-LD 메타데이터

---

## Phase 5: E2E 테스트

- [ ] E2E-1: 피드 로드 + 무한스크롤 시나리오
- [ ] E2E-2: 포스트 작성 → 발행 → 상세 확인 플로우
- [ ] E2E-3: 좋아요 토글 (로그인/비로그인)
- [ ] E2E-4: 댓글 작성 + 대댓글 플로우
- [x] HOOK-TEST3: encoding test
- [ ] E2E-5: 태그 필터 + 시리즈 네비게이션
- [ ] E2E-6: 프로필 수정 플로우
