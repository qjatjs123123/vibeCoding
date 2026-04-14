# API Route 컨벤션

## 파일 구조

**경로**: `app/api/routes/{resource}.py`
**라우터 명명**: `router = APIRouter(prefix="/api/{resource}", tags=["{resource}"])`

---

## 기본 패턴

```python
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user, get_db

router = APIRouter(prefix="/api/posts", tags=["posts"])

# GET: 조회 (인증 불필요)
@router.get("")
async def list_items(db = Depends(get_db)):
    return items

# POST: 생성 (인증 필수)
@router.post("", status_code=201)
async def create_item(req: CreateRequest, db = Depends(get_db), 
                     current_user = Depends(get_current_user)):
    # 입력 검증은 Pydantic이 자동 처리
    # 인증 필요 시 get_current_user 의존성 추가
    return item

# PATCH: 수정 (본인 확인)
@router.patch("/{id}")
async def update_item(id: str, req: UpdateRequest, db = Depends(get_db),
                     current_user = Depends(get_current_user)):
    item = db.query(Item).get(id)
    if item.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return item

# DELETE: 삭제 (본인 확인)
@router.delete("/{id}")
async def delete_item(id: str, db = Depends(get_db),
                     current_user = Depends(get_current_user)):
    item = db.query(Item).get(id)
    if item.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}
```

---

## 에러 처리

```python
# 404: 리소스 없음
if not item:
    raise HTTPException(status_code=404, detail="Item not found")

# 403: 권한 없음
if item.author_id != current_user.id:
    raise HTTPException(status_code=403, detail="Forbidden")

# 400: 잘못된 입력
if invalid_data:
    raise HTTPException(status_code=400, detail="Invalid input")
```

---

## 라우터 등록 (app/main.py)

```python
from app.api.routes import posts, users, series

app.include_router(posts.router)
app.include_router(users.router)
app.include_router(series.router)
```
