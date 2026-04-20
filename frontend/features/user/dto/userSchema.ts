import { z } from 'zod';
import type {
  UserDto,
  GetUserProfileResponseDto,
  GetMeResponseDto,
  UpdateUserRequestDto,
  UpdateUserResponseDto,
} from './userDto';

/**
 * User DTO Zod Schema
 */
export const UserDtoSchema: z.ZodType<UserDto> = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(20),
  email: z.string().email(),
  avatar_url: z.string().url().optional().nullable(),
  bio: z.string().optional().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/**
 * 프로필 조회 응답 Schema
 */
export const GetUserProfileResponseDtoSchema: z.ZodType<GetUserProfileResponseDto> =
  z.object({
    user: UserDtoSchema,
  });

/**
 * 현재 유저 정보 응답 Schema
 */
export const GetMeResponseDtoSchema: z.ZodType<GetMeResponseDto> = z.object({
  user: UserDtoSchema,
  needs_username: z.boolean().optional(),
});

/**
 * 유저 정보 수정 요청 Schema
 */
export const UpdateUserRequestDtoSchema: z.ZodType<UpdateUserRequestDto> =
  z.object({
    username: z.string().min(3).max(20).optional(),
    email: z.string().email().optional(),
    bio: z.string().optional(),
    avatar_url: z.string().url().optional(),
  });

/**
 * 유저 정보 수정 응답 Schema
 */
export const UpdateUserResponseDtoSchema: z.ZodType<UpdateUserResponseDto> =
  z.object({
    user: UserDtoSchema,
  });
