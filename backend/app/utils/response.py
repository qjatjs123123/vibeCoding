from fastapi.responses import JSONResponse
from typing import Any


def success_response(
    data: Any = None, message: str = "Success", status_code: int = 200
) -> JSONResponse:
    """성공 응답"""
    return JSONResponse(
        status_code=status_code,
        content={"success": True, "message": message, "data": data},
    )


def error_response(
    message: str = "Error", status_code: int = 400, detail: Any = None
) -> JSONResponse:
    """에러 응답"""
    return JSONResponse(
        status_code=status_code,
        content={"success": False, "message": message, "error": detail},
    )


def calculate_reading_time(content: str) -> int:
    """콘텐츠의 읽기 시간 계산 (분 단위, 분당 200단어 기준)"""
    if not content:
        return 1
    word_count = len(content.split())
    reading_time = max(1, round(word_count / 200))
    return reading_time
