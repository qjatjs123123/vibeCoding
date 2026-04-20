import { Suspense } from 'react';
import { PostList } from '@/features/post/components/PostList';
import { Skeleton } from '@/components/ui/Skeleton';

export const revalidate = 3600; // ISR: 1시간마다 갱신

async function FeedContent() {
  // 서버에서 포스트 데이터 가져오기
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${baseUrl}/api/posts?feed=recent&limit=12`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error('Failed to fetch posts');

    const data = await res.json();
    const posts = Array.isArray(data.posts) ? data.posts : [];

    // DTO를 Post 모델로 변환
    const transformedPosts = posts.map((p: any) => ({
      ...p,
      publishedAt: new Date(p.publishedAt),
      tags: p.tags || [],
    }));

    return <PostList initialPosts={transformedPosts} hasMore={!!data.nextCursor} />;
  } catch (error) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <div className="text-center">
          <p className="font-semibold text-red-700 dark:text-red-300">포스트를 불러올 수 없습니다.</p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            서버 연결을 확인하고 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }
}

function FeedSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="h-80 rounded-lg" />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          최신 포스트
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          개발자들의 최신 블로그 포스트를 확인하세요.
        </p>
      </div>

      <Suspense fallback={<FeedSkeleton />}>
        <FeedContent />
      </Suspense>
    </main>
  );
}
