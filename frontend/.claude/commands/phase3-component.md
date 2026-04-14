# /phase3-component — Phase 3: Feature Layer (Components)

`frontend/TODO.md`의 Phase 3 항목을 순서대로 실행합니다.

---

## 실행 절차

### 1️⃣ TODO 읽기
`frontend/TODO.md`의 Phase 3에서 첫 `[ ]` 항목을 찾습니다 (COMP-1~COMP-11).

### 2️⃣ 컨텍스트 파악
**참고**: `frontend/.claude/rules/react-component.md`

핵심:
- Server vs Client component 판단
- Props interface 정의 (항상 `${Component}Props`)
- 1파일 1컴포넌트
- Tailwind 스타일만 (inline style 금지)
- 테스트: `@testing-library/react` + `userEvent`

### 3️⃣ 작업 실행

```typescript
// ✅ 형식
interface PostCardProps {
  post: Post;
  onLike?: () => void;
}

export function PostCard({ post, onLike }: PostCardProps) {
  return (
    <div className="p-4 border rounded-lg hover:shadow-md">
      <h2 className="text-xl font-bold">{post.title}</h2>
      {/* ... */}
    </div>
  );
}
```

### 4️⃣ 검증

**Step A — TypeScript:**
```bash
npx tsc --noEmit
```

**Step B — Playwright MCP 실시간 검증:**

> ⚠️ 선행조건: `pnpm dev` 실행 중 + `/dev/components/[name]` 페이지 등록

1. `http://localhost:3000/dev/components/{ComponentName}` 으로 navigate
2. screenshot 캡처 → 렌더링 확인
3. 콘솔 에러/경고 수집
4. 에러 발견 시:
   - 에러 분석 → 코드 수정 → 파일 저장
   - 다시 navigate → screenshot → 에러 확인
   - 최대 3회 반복. 3회 초과 시 사용자에게 보고하고 중단.
5. 에러 없으면 통과

**Step C — Vitest 테스트:**
```bash
npx vitest run src/components/{Component}.test.tsx
```
테스트 **PASS** 확인.

### 5️⃣ 체크
TODO.md에서 항목을 `[x]`로 변경합니다.

### 6️⃣ 리포트
```
✅ [완료] COMP-1: 공통 컴포넌트 (Button, Input, Avatar, Skeleton, ErrorFallback)
  - 5개 컴포넌트 생성
  - TypeScript 검증 통과

➡️ [다음] COMP-2: PostCard 컴포넌트 + 테스트
```

---

## 컴포넌트 특기사항

### COMP-3: PostList (무한스크롤)
- IntersectionObserver 사용
- 마지막 항목 감지 시 다음 페이지 fetch
- TanStack Query의 `useInfiniteQuery` 활용
- 테스트: IntersectionObserver mock (`vitest.setup.ts`에 이미 정의)

### COMP-4: PostDetail (Markdown)
- `react-markdown` + `remark-gfm` + `rehype-highlight`
- `rehype-sanitize`로 XSS 방어 (매우 중요)
- 코드 하이라이팅 확인

### COMP-5: MarkdownEditor
- `@uiw/react-md-editor` (dynamic import)
- 이미지 드래그앤드롭 → `/api/upload` 호출
- 분할 뷰 (편집/미리보기)

### COMP-6: CommentList
- soft-delete 댓글 표시 (`"[삭제된 댓글입니다]"`)
- 대댓글은 1단계만 (parentId 확인)
- 시간순 정렬 (createdAt DESC)

### COMP-7: CommentForm
- 인증 필요 → 비로그인 시 비활성화 또는 로그인 프롬프트
- `react-hook-form` 선택사항 (간단하면 useState)

### COMP-8: LikeButton
- 낙관적 업데이트 (State Layer의 `useLikeMutation` 사용)
- 애니메이션 (하트 scale/color change)
- 로그인 상태에 따라 처리 다름

---

## 주의사항

- **1파일 1컴포넌트**: 같은 파일에 여러 컴포넌트 금지
- **Props 인터페이스 필수**: `any` 금지
- **Tailwind only**: inline `style={{}}` 금지
- **테스트**: 로직 + UI 상태 변화 테스트
- **타입 검사**: 빌드 전 `tsc --noEmit` 통과 필수

---

## 테스트 예시

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostCard } from './PostCard';

describe('PostCard', () => {
  const mockPost: Post = {
    id: '1',
    title: 'Test',
    // ...
  };

  it('should render post title', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should call onLike when button clicked', async () => {
    const onLike = vi.fn();
    const user = userEvent.setup();
    
    render(<PostCard post={mockPost} onLike={onLike} />);
    await user.click(screen.getByRole('button', { name: /like/i }));
    
    expect(onLike).toHaveBeenCalled();
  });
});
```
