import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://vibecoding.dev';

  // 기본 페이지들
  const pages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/recent`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/trending`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/series`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 동적 페이지들 (백엔드에서 가져옴)
  try {
    const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // 포스트들
    const postsRes = await fetch(`${baseApiUrl}/api/posts?limit=1000`);
    if (postsRes.ok) {
      const postsData = await postsRes.json();
      const posts = Array.isArray(postsData.posts) ? postsData.posts : [];
      posts.forEach((post: any) => {
        pages.push({
          url: `${baseUrl}/${post.author?.username}/${post.slug}`,
          lastModified: new Date(post.publishedAt),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      });
    }

    // 태그들
    const tagsRes = await fetch(`${baseApiUrl}/api/tags?limit=100`);
    if (tagsRes.ok) {
      const tagsData = await tagsRes.json();
      const tags = Array.isArray(tagsData.tags) ? tagsData.tags : [];
      tags.forEach((tag: any) => {
        pages.push({
          url: `${baseUrl}/tags/${encodeURIComponent(tag.name)}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      });
    }
  } catch (error) {
    console.error('Failed to fetch dynamic content for sitemap:', error);
  }

  return pages;
}
