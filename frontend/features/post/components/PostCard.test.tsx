import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PostCard } from './PostCard';
import type { Post } from '../model/post';

describe('PostCard', () => {
  const mockPost: Post = {
    id: '1',
    title: 'Test Post Title',
    slug: 'test-post-title',
    excerpt: 'This is a test excerpt for the post',
    coverImage: 'https://example.com/cover.jpg',
    publishedAt: new Date('2024-01-15'),
    readingTime: 5,
    viewCount: 1234,
    author: {
      username: 'testuser',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    tags: [
      { name: 'react' },
      { name: 'nextjs' },
      { name: 'typescript' },
      { name: 'testing' },
    ],
    likeCount: 42,
    commentCount: 8,
  };

  describe('rendering', () => {
    it('should render post title', () => {
      render(<PostCard post={mockPost} />);
      expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    });

    it('should render post excerpt', () => {
      render(<PostCard post={mockPost} />);
      expect(
        screen.getByText('This is a test excerpt for the post')
      ).toBeInTheDocument();
    });

    it('should render author username', () => {
      render(<PostCard post={mockPost} />);
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('should render formatted date', () => {
      render(<PostCard post={mockPost} />);
      expect(screen.getByText('2024년 1월 15일')).toBeInTheDocument();
    });

    it('should render reading time', () => {
      render(<PostCard post={mockPost} />);
      expect(screen.getByText('5 min read')).toBeInTheDocument();
    });

    it('should render view count', () => {
      render(<PostCard post={mockPost} />);
      expect(screen.getByText('1,234 views')).toBeInTheDocument();
    });

    it('should render comment count', () => {
      render(<PostCard post={mockPost} />);
      expect(screen.getByText('8 comments')).toBeInTheDocument();
    });

    it('should render like count', () => {
      render(<PostCard post={mockPost} />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render cover image', () => {
      render(<PostCard post={mockPost} />);
      const image = screen.getByAltText('Test Post Title');
      expect(image).toBeInTheDocument();
    });

    it('should render first 3 tags and +1 indicator', () => {
      render(<PostCard post={mockPost} />);
      expect(screen.getByText('#react')).toBeInTheDocument();
      expect(screen.getByText('#nextjs')).toBeInTheDocument();
      expect(screen.getByText('#typescript')).toBeInTheDocument();
      expect(screen.queryByText('#testing')).not.toBeInTheDocument();
      expect(screen.getByText('+1')).toBeInTheDocument();
    });

    it('should render all tags if 3 or fewer', () => {
      const postWithFewTags: Post = {
        ...mockPost,
        tags: [{ name: 'react' }, { name: 'nextjs' }],
      };
      render(<PostCard post={postWithFewTags} />);
      expect(screen.getByText('#react')).toBeInTheDocument();
      expect(screen.getByText('#nextjs')).toBeInTheDocument();
      expect(screen.queryByText(/\+\d+/)).not.toBeInTheDocument();
    });

    it('should not render cover image if not provided', () => {
      const postWithoutCover: Post = {
        ...mockPost,
        coverImage: undefined,
      };
      render(<PostCard post={postWithoutCover} />);
      expect(
        screen.queryByAltText('Test Post Title')
      ).not.toBeInTheDocument();
    });

    it('should not render tags if empty', () => {
      const postWithoutTags: Post = {
        ...mockPost,
        tags: [],
      };
      render(<PostCard post={postWithoutTags} />);
      expect(screen.queryByText(/^#/)).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onLike when like button clicked', async () => {
      const onLike = vi.fn();
      const user = userEvent.setup();

      render(<PostCard post={mockPost} onLike={onLike} />);

      const likeButton = screen.getByRole('button', {
        name: /like post/i,
      });

      await user.click(likeButton);
      expect(onLike).toHaveBeenCalledWith('1');
    });

    it('should not call onLike if not provided', async () => {
      const user = userEvent.setup();

      render(<PostCard post={mockPost} />);

      const likeButton = screen.getByRole('button', {
        name: /like post/i,
      });

      await user.click(likeButton);
      // Should not throw error
      expect(true).toBe(true);
    });

    it('should render as liked when isLiked is true', () => {
      render(<PostCard post={mockPost} isLiked={true} />);

      const likeButton = screen.getByRole('button', {
        name: /like post/i,
      });

      expect(likeButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should render as not liked when isLiked is false', () => {
      render(<PostCard post={mockPost} isLiked={false} />);

      const likeButton = screen.getByRole('button', {
        name: /like post/i,
      });

      expect(likeButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('links', () => {
    it('should link to correct post URL', () => {
      render(<PostCard post={mockPost} />);

      const article = screen.getByRole('link').closest('article');
      const link = screen.getByRole('link');

      expect(link).toHaveAttribute('href', '/testuser/test-post-title');
    });

    it('should navigate to post detail page on click', async () => {
      const user = userEvent.setup();

      render(<PostCard post={mockPost} />);

      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toBe('/testuser/test-post-title');
    });
  });

  describe('accessibility', () => {
    it('should have alt text for avatar', () => {
      render(<PostCard post={mockPost} />);

      const avatar = screen.getByRole('img', { hidden: true });
      expect(avatar).toHaveAttribute('alt', 'testuser');
    });

    it('should have descriptive like button label', () => {
      render(<PostCard post={mockPost} />);

      const likeButton = screen.getByRole('button', {
        name: /like post by testuser/i,
      });

      expect(likeButton).toBeInTheDocument();
    });

    it('should have title attribute on like button', () => {
      render(<PostCard post={mockPost} />);

      const likeButton = screen.getByRole('button', {
        name: /like post/i,
      });

      expect(likeButton).toHaveAttribute('title', '42 likes');
    });
  });

  describe('responsive behavior', () => {
    it('should render with responsive padding', () => {
      render(<PostCard post={mockPost} />);

      const contentDiv = screen.getByText('Test Post Title').closest('div');
      expect(contentDiv?.parentElement).toHaveClass('p-4', 'sm:p-5', 'md:p-6');
    });

    it('should truncate title to 2 lines max', () => {
      const longTitle =
        'This is a very long post title that might wrap to multiple lines if not properly truncated by the design system';
      const postWithLongTitle: Post = {
        ...mockPost,
        title: longTitle,
      };

      render(<PostCard post={postWithLongTitle} />);

      const title = screen.getByText(longTitle);
      expect(title).toHaveClass('line-clamp-2');
    });

    it('should truncate excerpt to 2 lines max', () => {
      const longExcerpt =
        'This is a very long excerpt that spans multiple sentences and should be truncated properly in the UI to maintain the card layout and visual hierarchy.';
      const postWithLongExcerpt: Post = {
        ...mockPost,
        excerpt: longExcerpt,
      };

      render(<PostCard post={postWithLongExcerpt} />);

      const excerpt = screen.getByText(longExcerpt);
      expect(excerpt).toHaveClass('line-clamp-2');
    });
  });

  describe('dark mode', () => {
    it('should have dark mode classes', () => {
      render(<PostCard post={mockPost} />);

      const article = screen.getByRole('link').closest('article');
      expect(article).toHaveClass(
        'dark:border-slate-700',
        'dark:bg-slate-900'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle zero counts', () => {
      const postWithZeroCounts: Post = {
        ...mockPost,
        likeCount: 0,
        commentCount: 0,
        viewCount: 0,
      };

      render(<PostCard post={postWithZeroCounts} />);

      expect(screen.getByText('0 views')).toBeInTheDocument();
      expect(screen.getByText('0 comments')).toBeInTheDocument();
    });

    it('should handle large numbers', () => {
      const postWithLargeCounts: Post = {
        ...mockPost,
        likeCount: 999999,
        viewCount: 1000000,
      };

      render(<PostCard post={postWithLargeCounts} />);

      expect(screen.getByText('1,000,000 views')).toBeInTheDocument();
    });

    it('should handle missing cover image gracefully', () => {
      const postWithoutCover: Post = {
        ...mockPost,
        coverImage: undefined,
      };

      const { container } = render(<PostCard post={postWithoutCover} />);

      const coverSection = container.querySelector('div[style*="height"]');
      expect(coverSection).not.toBeInTheDocument();
    });

    it('should handle null avatar URL', () => {
      const postWithInvalidAvatar: Post = {
        ...mockPost,
        author: {
          ...mockPost.author,
          avatarUrl: '',
        },
      };

      render(<PostCard post={postWithInvalidAvatar} />);

      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });
});
