# SQLAlchemy ORM 패턴

## 기본 쿼리

```python
from sqlalchemy.orm import Session

# 단일 조회
item = db.query(Item).filter(Item.id == id).first()
if not item:
    raise HTTPException(status_code=404)

# 목록 조회
items = db.query(Item).all()

# 필터링
items = db.query(Item).filter(Item.published == True).all()

# 정렬
items = db.query(Item).order_by(Item.created_at.desc()).all()

# 페이지네이션 (limit + offset)
items = db.query(Item).limit(10).offset(0).all()

# 커서 기반 페이지네이션
if cursor:
    items = db.query(Item).filter(Item.created_at < cursor_date).all()
```

---

## 생성 / 수정 / 삭제

```python
# 생성
item = Item(title="...", author_id=user.id)
db.add(item)
db.commit()

# 수정
item.title = "updated"
db.commit()  # 자동 감지

# 삭제
db.delete(item)
db.commit()

# Upsert (토글)
like = db.query(Like).filter(...).first()
if like:
    db.delete(like)  # 좋아요 취소
else:
    db.add(Like(...))  # 좋아요 추가
db.commit()
```

---

## 관계 (Relationship)

```python
# 연관 데이터 포함
post = db.query(Post).filter(Post.id == id).first()
post.author  # User 객체 (lazy loading)
post.comments  # Comment 리스트 (lazy loading)

# eager loading (N+1 문제 방지)
from sqlalchemy.orm import joinedload
post = db.query(Post).options(
    joinedload(Post.author),
    joinedload(Post.comments)
).filter(Post.id == id).first()

# Join 쿼리
posts = db.query(Post).join(User).filter(User.username == "john").all()
```

---

## 집계 (Aggregation)

```python
from sqlalchemy import func

# 개수
count = db.query(func.count(Post.id)).filter(Post.author_id == user_id).scalar()

# 그룹화
by_tag = db.query(Tag, func.count(Post.id)).join(PostTag).group_by(Tag.id).all()

# 정렬된 그룹화 (인기 태그)
tags = db.query(Tag, func.count(Post.id).label("cnt")).outerjoin(PostTag)\
    .group_by(Tag.id).order_by(func.count(Post.id).desc()).limit(50).all()
```

---

## 트랜잭션

```python
try:
    db.add(item1)
    db.add(item2)
    db.commit()
except Exception as e:
    db.rollback()  # 변경사항 취소
    raise
```
