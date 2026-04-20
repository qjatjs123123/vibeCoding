export const revalidate = 3600; // ISR: 1시간

async function SeriesContent() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${baseUrl}/api/series?limit=100`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error('Failed to fetch series');

    const data = await res.json();
    const series = Array.isArray(data.series) ? data.series : [];

    return (
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            시리즈
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            개발자들이 만든 주제별 시리즈를 둘러보세요.
          </p>
        </div>

        {series.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">아직 시리즈가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {series.map((s: any) => (
              <a
                key={s.id}
                href={`/${s.author?.username}/series/${s.slug}`}
                className="rounded-lg border border-gray-200 p-6 hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:hover:border-blue-500 transition"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {s.description || ''}
                </p>
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  {s.postCount || 0} posts
                </p>
              </a>
            ))}
          </div>
        )}
      </main>
    );
  } catch (error) {
    return (
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">시리즈를 불러올 수 없습니다.</p>
        </div>
      </main>
    );
  }
}

export default function SeriesPage() {
  return <SeriesContent />;
}
