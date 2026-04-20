/**
 * User Domain Model — 프론트엔드에서 사용할 깔끔한 타입
 */

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: Date; // ISO 문자열 → Date 객체로 변환
  updatedAt: Date;
}

/**
 * 유저 프로필 응답
 */
export interface UserProfile {
  user: User;
}

/**
 * 현재 유저 정보 응답
 */
export interface CurrentUser {
  user: User;
  needsUsername?: boolean; // OAuth 첫 로그인 시 username 설정 필요
}

/**
 * 유저 정보 수정 입력
 */
export interface UpdateUserInput {
  username?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
}

/**
 * 유저 정보 수정 응답
 */
export interface UpdateUserOutput {
  user: User;
}
