from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.routes import auth, posts, likes, comments, users, series, tags, search, upload

settings = get_settings()

app = FastAPI(
    title="vibeCoding Backend",
    description="Velog-style Korean developer blog platform API",
    version="0.1.0",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(likes.router)
app.include_router(comments.router)
app.include_router(users.router)
app.include_router(series.router)
app.include_router(tags.router)
app.include_router(search.router)
app.include_router(upload.router)


@app.get("/api/health")
async def health_check():
    """헬스 체크"""
    return {"status": "ok"}


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {"message": "vibeCoding Backend API"}
