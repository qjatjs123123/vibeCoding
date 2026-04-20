import type { User, CurrentUser, UpdateUserInput, UpdateUserOutput } from '../model/user';

/**
 * User Repository Interface
 * 모든 유저 관련 데이터 접근 메서드를 정의
 */
export interface IUserRepository {
  /**
   * 유저 프로필 조회 (공개)
   * GET /api/users/{username}
   */
  getUserByUsername(username: string): Promise<User>;

  /**
   * 현재 로그인한 유저 정보 조회 (인증 필수)
   * GET /api/users/me
   */
  getMe(): Promise<CurrentUser>;

  /**
   * 현재 유저 정보 수정 (인증 필수)
   * PATCH /api/users/me
   */
  updateMe(input: UpdateUserInput): Promise<UpdateUserOutput>;
}
