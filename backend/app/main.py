from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings

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


@app.get("/api/health")
async def health_check():
    """헬스 체크"""
    return {"status": "ok"}


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {"message": "vibeCoding Backend API"}
