interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export const revalidate = 3600; // ISR: 1시간

async function ProfileContent({ username }: { username: string }) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // 유저 정보 fetch
    const userRes = await fetch(`${baseUrl}/api/users/${encodeURIComponent(username)}`, {
      next: { revalidate: 3600 },
    });

    if (!userRes.ok) throw new Error('User not found');

    const user = await userRes.json();

    // 유저 포스트 목록 fetch
    let posts = [];
    try {
      const postsRes = await fetch(
        `${baseUrl}/api/posts?author=${encodeURIComponent(username)}&limit=10`,
        { next: { revalidate: 3600 } }
      );
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        posts = Array.isArray(postsData.posts) ? postsData.posts : [];
      }
    } catch (e) {
      // 포스트 로드 실패 시 빈 배열
      posts = [];
    }

    return (
      <div className="space-y-12">
        {/* 프로필 헤더 */}
        <section className="flex items-start gap-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0" />
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-[--color-text] font-display">
                {user.name || user.username}
              </h1>
              <p className="text-[--color-text-secondary] mt-2">
                @{user.username}
              </p>
            </div>
            <p className="text-[--color-text-secondary] max-w-2xl">
              {user.bio || '자기소개를 작성하지 않았습니다.'}
            </p>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="font-semibold text-[--color-text]">
                  {user.postCount || 0}
                </p>
                <p className="text-[--color-muted]">Posts</p>
              </div>
              <div>
                <p className="font-semibold text-[--color-text]">
                  {user.seriesCount || 0}
                </p>
                <p className="text-[--color-muted]">Series</p>
              </div>
              <div>
                <p className="font-semibold text-[--color-text]">
                  {user.followers || 0}
                </p>
                <p className="text-[--color-muted]">Followers</p>
              </div>
            </div>
          </div>
        </section>

        {/* 네비게이션 탭 */}
        <nav className="border-b border-[--color-border] space-x-8">
          <button className="pb-4 border-b-2 border-[--color-accent] text-[--color-text] font-medium">
            Posts
          </button>
          <button className="pb-4 text-[--color-text-secondary] hover:text-[--color-text]">
            Series
          </button>
          <button className="pb-4 text-[--color-text-secondary] hover:text-[--color-text]">
            About
          </button>
        </nav>

        {/* 포스트 목록 */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-[--color-text]">
            Recent Posts
          </h2>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[--color-text-secondary]">아직 포스트가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post: any) => (
                <a
                  key={post.id}
                  href={`/${username}/${post.slug}`}
                  className="block pb-6 border-b border-[--color-border] hover:opacity-75 transition"
                >
                  <h3 className="text-xl font-semibold text-[--color-text] hover:text-[--color-accent]">
                    {post.title}
                  </h3>
                  <p className="text-[--color-text-secondary] mt-2">
                    {post.excerpt || ''}
                  </p>
                  <div className="flex gap-4 mt-4 text-sm text-[--color-muted]">
                    <span>{post.readingTime || 5} min read</span>
                    <span>{post.viewCount || 0} views</span>
                    <span>{post.likeCount || 0} likes</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  } catch (error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <p className="text-red-600 dark:text-red-400">사용자를 찾을 수 없습니다.</p>
      </div>
    );
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <ProfileContent username={username} />
    </main>
  );
}
