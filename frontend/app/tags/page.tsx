import { Suspense } from 'react';

export const revalidate = 3600; // ISR: 1시간

async function TagsContent() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${baseUrl}/api/tags?limit=100`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error('Failed to fetch tags');

    const data = await res.json();
    const tags = Array.isArray(data.tags) ? data.tags : [];

    return (
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {tags.map((tag: any) => (
          <a
            key={tag.name}
            href={`/tags/${tag.name}`}
            className="group relative rounded-lg border border-gray-200 p-4 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:bg-blue-950 transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  #{tag.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {tag.postCount || 0}개 포스트
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    );
  } catch (error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <p className="text-red-600 dark:text-red-400">태그를 불러올 수 없습니다.</p>
      </div>
    );
  }
}

function TagsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 animate-pulse"
        />
      ))}
    </div>
  );
}

export default function TagsPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          태그
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          관심있는 기술 태그를 둘러보세요.
        </p>
      </div>

      <Suspense fallback={<TagsSkeleton />}>
        <TagsContent />
      </Suspense>
    </main>
  );
}
