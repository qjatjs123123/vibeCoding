import Image from 'next/image';
import Link from 'next/link';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Button } from '../../../src/components/ui/Button';
import type { User } from '../model/user';

interface UserProfileProps {
  user: User;
  isOwnProfile?: boolean;
  onEditClick?: () => void;
  postsCount?: number;
  seriesCount?: number;
}

export function UserProfile({
  user,
  isOwnProfile = false,
  onEditClick,
  postsCount = 0,
  seriesCount = 0,
}: UserProfileProps) {
  const joinDate = new Date(user.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6 md:p-8">
      {/* Header: Avatar + Username + Bio */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar
            src={user.avatarUrl}
            alt={user.username}
            size="lg"
            className="h-24 w-24 md:h-32 md:w-32"
          />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Username + Bio */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
              {user.username}
            </h1>
            {user.bio && (
              <p className="text-base text-slate-600 dark:text-slate-300">
                {user.bio}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {postsCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Posts
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {seriesCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Series
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Joined
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {joinDate}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isOwnProfile && onEditClick && (
          <div className="flex-shrink-0">
            <Button
              onClick={onEditClick}
              variant="primary"
              size="md"
              className="w-full md:w-auto"
              aria-label="Edit profile"
            >
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      {/* Email */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Email
          </span>
          <p className="text-sm text-slate-900 dark:text-slate-100">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}
