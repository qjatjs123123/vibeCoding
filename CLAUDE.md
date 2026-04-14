# CLAUDE.md — vibeCoding (Root)

Velog 스타일 한국 개발자 블로그 플랫폼. **모노레포** 구조.

## 모노레포 구조

```
vibeCoding/
├── frontend/          # Next.js 15 App Router (UI)
│   └── CLAUDE.md
├── backend/           # Next.js API Routes + Prisma (서버/DB)
    └── CLAUDE.md
```

## MVP 기능

- OAuth 로그인 (GitHub, Google)
- Markdown 포스트 CRUD (임시저장 포함)
- 태그 / 시리즈
- 댓글 (대댓글 1단계) / 좋아요
- 유저 프로필
- 피드 (최신, 트렌딩)

> 각 영역 상세 내용은 `frontend/CLAUDE.md`, `backend/CLAUDE.md` 참고
