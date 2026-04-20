import type { UserDto } from '../dto/userDto';
import type { User } from './user';

/**
 * User Mapper — DTO ↔ Domain 변환
 */
export class UserMapper {
  /**
   * DTO → Domain Model
   */
  static toDomain(dto: UserDto): User {
    return {
      id: dto.id,
      username: dto.username,
      email: dto.email,
      avatarUrl: dto.avatar_url || undefined,
      bio: dto.bio || undefined,
      createdAt: new Date(dto.created_at), // ISO 문자열 → Date
      updatedAt: new Date(dto.updated_at),
    };
  }

  /**
   * Domain Model → DTO (요청용)
   * User 업데이트 시 사용
   */
  static toUpdateDto(user: Partial<User>) {
    return {
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar_url: user.avatarUrl,
    };
  }
}
