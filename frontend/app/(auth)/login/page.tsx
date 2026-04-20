'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/api/auth/login', {
        email,
        password,
      });

      const { access_token, user_id, username } = response.data;
      setSession({
        userId: user_id,
        username,
        email,
        token: access_token,
      });

      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || '로그인에 실패했습니다.');
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
            개발자 블로그 플랫폼에 로그인하세요
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

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            계정이 없으신가요?{' '}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
