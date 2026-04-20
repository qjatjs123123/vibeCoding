'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUpdateUserProfile } from '@/features/user/state/useUserMutation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ProfileSettingsPage() {
  const session = useAuthStore((state) => state.session);
  const updateMutation = useUpdateUserProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (session) {
      setEmail(session.email || '');
    }
  }, [session]);

  if (!session) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-yellow-50 p-6 dark:bg-yellow-900">
          <p className="text-yellow-800 dark:text-yellow-200">
            프로필을 편집하려면{' '}
            <a href="/login" className="font-semibold hover:underline">
              로그인
            </a>
            하세요.
          </p>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await updateMutation.mutateAsync({
        name: name || undefined,
        email,
        bio: bio || undefined,
      });
      setSuccess('프로필이 저장되었습니다.');
    } catch (err: any) {
      setError(err.message || '프로필 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            프로필 편집
          </h1>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900 dark:text-green-200">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900">
          <div className="space-y-6">
            {/* 프로필 사진 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white">
                프로필 사진
              </label>
              <div className="mt-4 flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 transition"
                  disabled={isLoading}
                >
                  변경하기
                </button>
              </div>
            </div>

            {/* 이름 */}
            <Input
              label="이름"
              placeholder="이름을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />

            {/* 사용자명 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white">
                사용자명
              </label>
              <input
                type="text"
                value={session.username || ''}
                disabled
                className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 opacity-50"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                사용자명은 변경할 수 없습니다.
              </p>
            </div>

            {/* 이메일 */}
            <Input
              label="이메일"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />

            {/* 자기소개 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white">
                자기소개
              </label>
              <textarea
                placeholder="간단한 자기소개를 작성하세요"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={isLoading}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? '저장 중...' : '저장하기'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setName('');
                  setBio('');
                }}
                disabled={isLoading}
              >
                취소
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
