from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
import cloudinary
import cloudinary.uploader

from app.core.config import get_settings
from app.models.user import User
from app.api.deps import get_current_user, get_db

router = APIRouter(prefix="/api/upload", tags=["upload"])

settings = get_settings()

# Cloudinary 설정
cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
)


class UploadResponse(BaseModel):
    """파일 업로드 응답"""
    url: str


@router.post("", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """파일 업로드 (Cloudinary) - 인증 필수"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name required")

    try:
        # 파일을 Cloudinary에 업로드
        result = cloudinary.uploader.upload(
            file.file,
            resource_type="auto",
            folder=f"vibecoding/{current_user.id}",
        )

        return UploadResponse(url=result["secure_url"])

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")
