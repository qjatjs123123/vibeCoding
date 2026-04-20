import { AxiosInstance } from 'axios';
import {
  UserDtoSchema,
  GetUserProfileResponseDtoSchema,
  GetMeResponseDtoSchema,
  UpdateUserResponseDtoSchema,
} from '../dto/userSchema';
import { UserMapper } from '../model/userMapper';
import type {
  User,
  CurrentUser,
  UpdateUserInput,
  UpdateUserOutput,
} from '../model/user';
import type { IUserRepository } from './IUserRepository';

/**
 * User Repository 구현체 — axios 기반
 */
export class UserRepository implements IUserRepository {
  constructor(private axiosInstance: AxiosInstance) {}

  async getUserByUsername(username: string): Promise<User> {
    try {
      const { data } = await this.axiosInstance.get(`/api/users/${username}`);

      // Zod 검증
      const validated = GetUserProfileResponseDtoSchema.parse(data);

      // DTO → Domain 변환
      return UserMapper.toDomain(validated.user);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch user profile: ${username}`);
    }
  }

  async getMe(): Promise<CurrentUser> {
    try {
      const { data } = await this.axiosInstance.get('/api/users/me');

      // Zod 검증
      const validated = GetMeResponseDtoSchema.parse(data);

      // DTO → Domain 변환
      return {
        user: UserMapper.toDomain(validated.user),
        needsUsername: validated.needs_username,
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch current user info');
    }
  }

  async updateMe(input: UpdateUserInput): Promise<UpdateUserOutput> {
    try {
      const payload = {
        username: input.username,
        email: input.email,
        bio: input.bio,
        avatar_url: input.avatarUrl,
      };

      const { data } = await this.axiosInstance.patch('/api/users/me', payload);

      // Zod 검증
      const validated = UpdateUserResponseDtoSchema.parse(data);

      // DTO → Domain 변환
      return {
        user: UserMapper.toDomain(validated.user),
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to update user info');
    }
  }

  private handleError(error: unknown, message: string): Error {
    // axios 에러 또는 plain object 형태의 에러 처리
    const errorObj = error as any;

    if (errorObj?.response?.status === 401) {
      throw new Error('Unauthorized - Please login again');
    }
    if (errorObj?.response?.status === 403) {
      throw new Error('Forbidden - You do not have permission');
    }
    if (errorObj?.response?.status === 404) {
      throw new Error('User not found');
    }

    throw new Error(message);
  }
}
