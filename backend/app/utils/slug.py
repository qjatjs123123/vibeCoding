import re
import uuid


def generate_slug(title: str) -> str:
    """제목으로부터 slug 생성 (중복 방지용 uuid suffix)"""
    # 소문자로 변환
    slug = title.lower()
    # 특수문자 제거 및 공백을 하이픈으로 변환
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[-\s]+", "-", slug)
    slug = slug.strip("-")
    # UUID suffix 추가 (중복 방지)
    unique_suffix = uuid.uuid4().hex[:8]
    return f"{slug}-{unique_suffix}"
