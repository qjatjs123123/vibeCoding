from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.auth import LoginRequest, TokenResponse, UserRegister
from app.core.security import verify_password, create_access_token, hash_password
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
import re
import uuid

router = APIRouter(prefix="/api/auth", tags=["auth"])


def validate_username(username: str) -> bool:
    """Username 유효성 검사 (3~20자, 영문·숫자·하이픈만)"""
    if not (3 <= len(username) <= 20):
        return False
    if not re.match(r"^[a-z0-9-]+$", username):
        return False
    return True


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    """이메일과 비밀번호로 로그인"""
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not user.password_hash or not verify_password(
        req.password, user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user_id=str(user.id),
        username=user.username,
        needs_username=user.username is None,
    )


@router.post("/signup", response_model=TokenResponse)
async def signup(req: LoginRequest, db: Session = Depends(get_db)):
    """이메일과 비밀번호로 새 계정 생성"""
    # 이메일 중복 체크
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # 새 사용자 생성
    user = User(
        id=uuid.uuid4(),
        email=req.email,
        password_hash=hash_password(req.password),
        username=None,  # Username은 나중에 설정
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 토큰 생성
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user_id=str(user.id),
        username=user.username,
        needs_username=True,
    )


@router.post("/register", response_model=TokenResponse)
async def register(
    req: UserRegister,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Username 등록 (최초 로그인 후)"""
    # Username 유효성 검사
    if not validate_username(req.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must be 3-20 chars, only letters, numbers, hyphens",
        )

    # 중복 체크
    existing = db.query(User).filter(User.username == req.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    # Username 업데이트
    current_user.username = req.username
    db.commit()

    token = create_access_token({"sub": str(current_user.id)})
    return TokenResponse(
        access_token=token,
        user_id=str(current_user.id),
        username=current_user.username,
        needs_username=False,
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """로그아웃 (클라이언트에서 토큰 제거)"""
    return {"message": "Logged out successfully"}


@router.get("/session")
async def get_session(current_user: User = Depends(get_current_user)):
    """현재 로그인 세션 확인 (인증 필수)"""
    return {
        "user_id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username,
    }


@router.post("/signin")
async def signin(req: LoginRequest, db: Session = Depends(get_db)):
    """로그인 (login의 별칭)"""
    return await login(req, db)


@router.post("/signout")
async def signout(current_user: User = Depends(get_current_user)):
    """로그아웃 (logout의 별칭, 인증 필수)"""
    return await logout(current_user)
