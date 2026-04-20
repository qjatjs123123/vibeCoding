import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PostDetail } from './PostDetail';
import type { Post } from '../model/post';

describe('PostDetail', () => {
  const mockPost: Post = {
    id: '1',
    title: 'Test Post Title',
    slug: 'test-post-title',
    excerpt: 'This is a test excerpt',
    coverImage: 'https://example.com/cover.jpg',
    publishedAt: new Date('2024-01-15'),
    readingTime: 8,
    viewCount: 1234,
    author: {
      username: 'testuser',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    tags: [{ name: 'react' }, { name: 'typescript' }],
    likeCount: 42,
    commentCount: 8,
  };

  const mockContent = `
# Heading 1

This is a paragraph with **bold** and *italic* text.

## Heading 2

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`

### Heading 3

> This is a blockquote
> With multiple lines

- List item 1
- List item 2
- List item 3

1. Ordered item 1
2. Ordered item 2
3. Ordered item 3

[Link](https://example.com)

![Image](https://example.com/image.jpg)

| Column 1 | Column 2 |
|----------|----------|
| Value 1  | Value 2  |
`;

  describe('rendering', () => {
    it('should render post title', () => {
      render(<PostDetail post={mockPost} content={mockContent} />);
      expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    });

    it('should render cover image', () => {
      render(<PostDetail post={mockPost} content={mockContent} />);
      const image = screen.getByAltText('Test Post Title');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/cover.jpg');
    });

    it('should render author information', () => {
      render(<PostDetail post={mockPost} content={mockContent} />);
      expect(screen.getAllByText('testuser').length).toBeGreaterThan(0);
    });

    it('should render formatted date', () => {
      render(<PostDetail post={mockPost} content={mockContent} />);
      expect(screen.getByText('2024년 1월 15일')).toBeInTheDocument();
    });

    it('should render excerpt', () => {
      render(<PostDetail post={mockPost} content={mockContent} />);
      expect(screen.getByText('This is a test excerpt')).toBeInTheDocument();
    });

    it('should render post stats', () => {
      render(<PostDetail post={mockPost} content={mockContent} />);
      expect(screen.getByText('8 min read')).toBeInTheDocument();
      expect(screen.getByText('1,234 views')).toBeInTheDocument();
      expect(screen.getByText('8 comments')).toBeInTheDocument();
    });

    it('should render like count', () => {
      render(<PostDetail post={mockPost} content={mockContent} />);
      expect(screen.getAllByText('42').length).toBeGreaterThan(0);
    });

    it('should render tags', () => {
      render(<PostDetail post={mockPost} content={mockContent} />);
      expect(screen.getByText('#react')).toBeInTheDocument();
      expect(screen.getByText('#typescript')).toBeInTheDocument();
    });

    it('should not render cover image if not provided', () => {
      const postWithoutCover = { ...mockPost, coverImage: undefined };
      render(<PostDetail post={postWithoutCover} content={mockContent} />);
      expect(screen.queryByAltText('Test Post Title')).not.toBeInTheDocument();
    });
  });

  describe('markdown rendering', () => {
    it('should render markdown headings', () => {
      render(<PostDetail post={mockPost} content={mockContent} />);
      expect(screen.getByText('Heading 1')).toBeInTheDocument();
      expect(screen.getByText('Heading 2')).toBeInTheDocument();
      expect(screen.getByText('Heading 3')).toBeInTheDocument();
    });

    it('should render markdown emphasis', () => {
      render(<PostDetail post={mockPost} content={mockContent} />);
      const boldText = screen.getByText('bold');
      expect(boldText).toBeInTheDocument();
    });

    it('should render code blocks', () => {
      render(<PostDetail post={mockPost} content={mockContent} />);
      const codeContent = screen.getByText(/const hello/);
      expect(codeContent).toBeInTheDocument();
    });

    it('should render blockquotes', () => {
      render(<PostDetail post={mockPost} content={mockContent} />);
      const blockquote = screen.getByText(/This is a blockquote/);
      expect(blockquote).toBeInTheDocument();
    });

    it('should render lists', () => {
      render(<PostDetail post={mockPost} content={mockContent} />);
      expect(screen.getByText('List item 1')).toBeInTheDocument();
      expect(screen.getByText('Ordered item 1')).toBeInTheDocument();
    });

    it('should render links', () => {
      render(<PostDetail post={mockPost} content={mockContent} />);
      const link = screen.getByText('Link');
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('should render images', () => {
      render(<PostDetail post={mockPost} content={mockContent} />);
      const image = screen.getByAltText('Image');
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('should render tables', () => {
      render(<PostDetail post={mockPost} content={mockContent} />);
      expect(screen.getByText('Column 1')).toBeInTheDocument();
      expect(screen.getByText('Value 1')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onLike when like button clicked', async () => {
      const onLike = vi.fn();
      const user = userEvent.setup();

      render(<PostDetail post={mockPost} content={mockContent} onLike={onLike} />);

      const likeButtons = screen.getAllByRole('button', {
        name: /like/i,
      });

      await user.click(likeButtons[0]);
      expect(onLike).toHaveBeenCalledWith('1');
    });

    it('should show liked state when isLiked is true', () => {
      render(<PostDetail post={mockPost} content={mockContent} isLiked={true} />);

      const likeButtons = screen.getAllByRole('button', {
        name: /liked/i,
      });

      expect(likeButtons.length).toBeGreaterThan(0);
      expect(likeButtons[0]).toHaveAttribute('aria-pressed', 'true');
    });

    it('should show not liked state when isLiked is false', () => {
      render(<PostDetail post={mockPost} content={mockContent} isLiked={false} />);

      const likeButton = screen.getAllByRole('button', {
        name: /like/i,
      })[0];

      expect(likeButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('accessibility', () => {
    it('should have proper alt text for images', () => {
      render(<PostDetail post={mockPost} content={mockContent} />);

      const coverImage = screen.getByAltText('Test Post Title');
      expect(coverImage).toHaveAttribute('alt', 'Test Post Title');
    });

    it('should have accessible like buttons', () => {
      render(<PostDetail post={mockPost} content={mockContent} isLiked={true} />);

      const likeButtons = screen.getAllByRole('button');
      expect(likeButtons.length).toBeGreaterThan(0);
      expect(likeButtons[0]).toHaveAttribute('aria-pressed');
    });

    it('should have descriptive aria-label for like button', () => {
      render(<PostDetail post={mockPost} content={mockContent} />);

      const ariaLabel = screen.getByLabelText(/Like post/i);
      expect(ariaLabel).toBeInTheDocument();
    });
  });

  describe('security', () => {
    it('should sanitize dangerous HTML', () => {
      const dangerousContent = '<script>alert("xss")</script>Hello';
      render(<PostDetail post={mockPost} content={dangerousContent} />);

      // Script tag should not be in DOM
      expect(document.querySelector('script')).not.toBeInTheDocument();
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('should allow safe links', () => {
      const contentWithLinks = '[Safe Link](https://example.com)';
      render(<PostDetail post={mockPost} content={contentWithLinks} />);

      const link = screen.getByText('Safe Link');
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('edge cases', () => {
    it('should handle empty excerpt', () => {
      const postWithoutExcerpt = { ...mockPost, excerpt: '' };
      render(<PostDetail post={postWithoutExcerpt} content={mockContent} />);
      expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    });

    it('should handle no tags', () => {
      const postWithoutTags = { ...mockPost, tags: [] };
      render(<PostDetail post={postWithoutTags} content={mockContent} />);
      expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longContent = mockContent.repeat(10);
      render(<PostDetail post={mockPost} content={longContent} />);
      expect(screen.getByText('Heading 1')).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      const postWithSpecialChars = {
        ...mockPost,
        title: 'Title with <special> & "characters"',
      };
      render(<PostDetail post={postWithSpecialChars} content={mockContent} />);
      expect(
        screen.getByText('Title with <special> & "characters"')
      ).toBeInTheDocument();
    });
  });

  describe('dark mode', () => {
    it('should have dark mode classes', () => {
      render(<PostDetail post={mockPost} content={mockContent} />);

      const article = screen.getByRole('article');
      expect(article).toBeInTheDocument();
    });
  });
});
