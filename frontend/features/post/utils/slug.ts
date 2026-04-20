/**
 * 제목에서 슬러그 생성 (URL-safe 문자열)
 * 예: "안녕하세요 NextJS" → "안녕하세요-nextjs"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s가-힣-]/g, '') // 영숫자, 한글, 하이픈만 유지
    .replace(/\s+/g, '-') // 공백 → 하이픈
    .replace(/-+/g, '-') // 연속 하이픈 제거
    .replace(/^-+|-+$/g, ''); // 시작/끝 하이픈 제거
}
