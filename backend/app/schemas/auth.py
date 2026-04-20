from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: Optional[str] = None
    needs_username: bool = False  # 최초 로그인시 True


class UserRegister(BaseModel):
    username: str = Field(
        ..., min_length=3, max_length=20, pattern="^[a-z0-9-]+$"
    )
    # 영문(소문자), 숫자, 하이픈만 허용


class OAuthCallback(BaseModel):
    code: str
    provider: str  # "github" | "google"
