/**
 * User DTO — 백엔드 API 응답을 그대로 매핑
 * snake_case 유지, 절대 변형 금지
 */

export interface UserDto {
  id: string; // UUID
  username: string;
  email: string;
  avatar_url?: string | null;
  bio?: string | null;
  created_at: string; // ISO8601 datetime
  updated_at: string; // ISO8601 datetime
}

/**
 * 프로필 조회 응답
 */
export interface GetUserProfileResponseDto {
  user: UserDto;
}

/**
 * 현재 유저 정보 응답
 */
export interface GetMeResponseDto {
  user: UserDto;
  needs_username?: boolean; // OAuth 첫 로그인 시 username 설정 필요
}

/**
 * 유저 정보 수정 요청
 */
export interface UpdateUserRequestDto {
  username?: string;
  email?: string;
  bio?: string;
  avatar_url?: string;
}

/**
 * 유저 정보 수정 응답
 */
export interface UpdateUserResponseDto {
  user: UserDto;
}
