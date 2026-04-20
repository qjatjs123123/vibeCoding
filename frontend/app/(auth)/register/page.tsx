'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const { setSession } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/api/auth/signup', {
        email,
        password,
      });

      const { access_token, user_id } = response.data;
      setSession({
        userId: user_id,
        username: '',
        email,
        token: access_token,
        needsUsername: true,
      });

      router.push('/settings/profile');
    } catch (err: any) {
      setError(err.response?.data?.detail || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            vibeCoding
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            개발자 커뮤니티에 가입하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          <Input
            type="email"
            label="이메일"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            type="password"
            label="비밀번호"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            type="password"
            label="비밀번호 확인"
            placeholder="••••••••"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            disabled={isLoading}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '가입 중...' : '가입'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
