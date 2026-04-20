from datetime import datetime
import math


def calc_trending_score(
    like_count: int, comment_count: int, view_count: int, published_at: datetime
) -> float:
    """포스트의 트렌딩 점수 계산"""
    hours_since = (datetime.utcnow() - published_at).total_seconds() / 3600
    numerator = like_count * 2 + view_count * 0.5 + comment_count
    denominator = math.pow(hours_since + 2, 1.5)
    return numerator / denominator if denominator > 0 else 0
