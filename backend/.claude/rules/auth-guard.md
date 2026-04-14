# 인증/인가 가드 패턴

## 의존성 (Dependency Injection)

```python
from fastapi import Depends, HTTPException, status
from app.api.deps import get_current_user, get_current_user_optional

# 인증 필수
@router.post("/posts")
async def create_post(req: CreatePostRequest,
                     current_user = Depends(get_current_user)):
    # 로그인한 사용자만 접근 가능
    # 미인증 시 401 Unauthorized 자동 반환
    return post

# 인증 선택
@router.get("/posts")
async def list_posts(current_user = Depends(get_current_user_optional)):
    # 로그인 여부 관계없이 접근 가능
    # current_user는 None이거나 User 객체
    if current_user:
        # 로그인한 경우의 로직
        pass
    return posts
```

---

## 인가 확인 (Authorization)

```python
# 본인만 수정/삭제 가능
@router.patch("/posts/{post_id}")
async def update_post(post_id: str, req: UpdatePostRequest,
                     current_user = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # 수정 로직
    return post
```

---

## 에러 응답

```python
# 401 Unauthorized: 인증 정보 없음/유효하지 않음
raise HTTPException(status_code=401, detail="Unauthorized")

# 403 Forbidden: 권한 없음
raise HTTPException(status_code=403, detail="Forbidden")

# 400 Bad Request: 유효성 검사 실패
# Pydantic이 자동 처리
```

---

## JWT 토큰

```python
from app.core.security import create_access_token, decode_token

# 토큰 생성
token = create_access_token({"sub": str(user.id)})

# 토큰 검증 (get_current_user에서 자동)
payload = decode_token(token)
user_id = payload.get("sub")
```

---

## 체크리스트

- [ ] 인증 필수 라우트에 get_current_user 추가
- [ ] 본인 확인: post.author_id != current_user.id 체크
- [ ] 404: 리소스 없으면 예외 발생
- [ ] 403: 권한 없으면 예외 발생
