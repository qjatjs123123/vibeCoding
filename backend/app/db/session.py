from sqlalchemy.orm import Session
from app.db.base import SessionLocal


def get_db() -> Session:
    """DB 세션을 제공하는 제너레이터"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
