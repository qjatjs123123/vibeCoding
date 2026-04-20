'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { session, logout } = useAuthStore();
  const router = useRouter();

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[--color-bg]/80 backdrop-blur-md border-b border-[--color-border]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-2xl font-bold text-[--color-accent] hover:text-[--color-accent-alt] transition-colors"
          >
            vibeCoding
          </Link>

          {/* 네비게이션 */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm text-[--color-text-secondary] hover:text-[--color-text] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/tags"
              className="text-sm text-[--color-text-secondary] hover:text-[--color-text] transition-colors"
            >
              Tags
            </Link>
          </nav>

          {/* 우측 액션 */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link href="/write">
                  <Button
                    variant="primary"
                    size="sm"
                    className="hidden sm:inline-flex"
                  >
                    ✍️ Write
                  </Button>
                </Link>

                {/* 프로필 드롭다운 */}
                <div className="relative group">
                  <button
                    className="flex items-center gap-2 rounded-lg p-1 hover:bg-[--color-surface] transition-colors"
                    aria-label="User menu"
                  >
                    <Avatar
                      src={session.avatarUrl}
                      alt={session.username}
                      size="sm"
                    />
                  </button>

                  {/* 드롭다운 메뉴 */}
                  <div className="absolute right-0 mt-0 hidden w-48 rounded-lg bg-[--color-surface] shadow-lg border border-[--color-border] group-hover:block">
                    <div className="px-4 py-3 border-b border-[--color-border]">
                      <p className="text-sm font-medium text-[--color-text]">
                        {session.username}
                      </p>
                      <p className="text-xs text-[--color-muted]">
                        {session.email}
                      </p>
                    </div>
                    <nav className="py-2">
                      <Link
                        href={`/@${session.username}`}
                        className="block px-4 py-2 text-sm text-[--color-text-secondary] hover:text-[--color-accent] transition-colors"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/settings/profile"
                        className="block px-4 py-2 text-sm text-[--color-text-secondary] hover:text-[--color-accent] transition-colors"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-[--color-danger] hover:bg-[--color-surface-secondary] transition-colors"
                      >
                        Logout
                      </button>
                    </nav>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
