import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SeriesBox } from './SeriesBox';

describe('SeriesBox', () => {
  const mockPosts = [
    {
      id: 'post-1',
      title: 'React Basics',
      slug: 'react-basics',
      author: { username: 'john' },
      seriesOrder: 1,
    },
    {
      id: 'post-2',
      title: 'React Hooks',
      slug: 'react-hooks',
      author: { username: 'john' },
      seriesOrder: 2,
    },
    {
      id: 'post-3',
      title: 'React Context',
      slug: 'react-context',
      author: { username: 'john' },
      seriesOrder: 3,
    },
  ];

  it('should render series box', () => {
    render(
      <SeriesBox
        seriesTitle="React Tutorial"
        posts={mockPosts}
      />
    );

    expect(screen.getByTestId('series-box')).toBeInTheDocument();
  });

  it('should display series title', () => {
    render(
      <SeriesBox
        seriesTitle="React Tutorial"
        posts={mockPosts}
      />
    );

    expect(screen.getByText('React Tutorial')).toBeInTheDocument();
  });

  it('should render all posts', () => {
    render(
      <SeriesBox
        seriesTitle="React Tutorial"
        posts={mockPosts}
      />
    );

    expect(screen.getByTestId('series-posts')).toBeInTheDocument();
    expect(screen.getByTestId('series-post-post-1')).toBeInTheDocument();
    expect(screen.getByTestId('series-post-post-2')).toBeInTheDocument();
    expect(screen.getByTestId('series-post-post-3')).toBeInTheDocument();
  });

  it('should display post titles', () => {
    render(
      <SeriesBox
        seriesTitle="React Tutorial"
        posts={mockPosts}
      />
    );

    expect(screen.getByTestId('series-title-post-1')).toHaveTextContent('React Basics');
    expect(screen.getByTestId('series-title-post-2')).toHaveTextContent('React Hooks');
    expect(screen.getByTestId('series-title-post-3')).toHaveTextContent('React Context');
  });

  it('should display order numbers padded with zeros', () => {
    render(
      <SeriesBox
        seriesTitle="React Tutorial"
        posts={mockPosts}
      />
    );

    expect(screen.getByTestId('series-order-post-1')).toHaveTextContent('01');
    expect(screen.getByTestId('series-order-post-2')).toHaveTextContent('02');
    expect(screen.getByTestId('series-order-post-3')).toHaveTextContent('03');
  });

  it('should highlight current post', () => {
    render(
      <SeriesBox
        seriesTitle="React Tutorial"
        posts={mockPosts}
        currentPostId="post-2"
      />
    );

    const currentBadge = screen.getByTestId('series-current-badge-post-2');
    expect(currentBadge).toHaveTextContent('읽는 중');
  });

  it('should not show current badge for other posts', () => {
    render(
      <SeriesBox
        seriesTitle="React Tutorial"
        posts={mockPosts}
        currentPostId="post-2"
      />
    );

    expect(screen.queryByTestId('series-current-badge-post-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('series-current-badge-post-3')).not.toBeInTheDocument();
  });

  it('should display progress bar when currentPostId is provided', () => {
    render(
      <SeriesBox
        seriesTitle="React Tutorial"
        posts={mockPosts}
        currentPostId="post-2"
      />
    );

    expect(screen.getByTestId('series-progress-bar')).toBeInTheDocument();
    expect(screen.getByTestId('series-progress-text')).toHaveTextContent('67%');
  });

  it('should calculate progress correctly', () => {
    render(
      <SeriesBox
        seriesTitle="React Tutorial"
        posts={mockPosts}
        currentPostId="post-1"
      />
    );

    // 1st post out of 3: 33%
    expect(screen.getByTestId('series-progress-text')).toHaveTextContent('33%');
  });

  it('should calculate progress for last post', () => {
    render(
      <SeriesBox
        seriesTitle="React Tutorial"
        posts={mockPosts}
        currentPostId="post-3"
      />
    );

    // 3rd post out of 3: 100%
    expect(screen.getByTestId('series-progress-text')).toHaveTextContent('100%');
  });

  it('should not display progress bar without currentPostId', () => {
    render(
      <SeriesBox
        seriesTitle="React Tutorial"
        posts={mockPosts}
      />
    );

    expect(screen.queryByTestId('series-progress-bar')).not.toBeInTheDocument();
  });

  it('should show series link when provided', () => {
    render(
      <SeriesBox
        seriesTitle="React Tutorial"
        posts={mockPosts}
        seriesLink="/john/series/react-tutorial"
      />
    );

    const link = screen.getByTestId('series-link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('전체 보기');
    expect(link).toHaveAttribute('href', '/john/series/react-tutorial');
  });

  it('should not show series link when not provided', () => {
    render(
      <SeriesBox
        seriesTitle="React Tutorial"
        posts={mockPosts}
      />
    );

    expect(screen.queryByTestId('series-link')).not.toBeInTheDocument();
  });

  it('should sort posts by seriesOrder', () => {
    const unsortedPosts = [
      { ...mockPosts[2], seriesOrder: 3 },
      { ...mockPosts[0], seriesOrder: 1 },
      { ...mockPosts[1], seriesOrder: 2 },
    ];

    render(
      <SeriesBox
        seriesTitle="React Tutorial"
        posts={unsortedPosts}
      />
    );

    const orders = screen.getAllByTestId(/^series-order-/);
    expect(orders[0]).toHaveTextContent('01');
    expect(orders[1]).toHaveTextContent('02');
    expect(orders[2]).toHaveTextContent('03');
  });

  it('should generate correct links to posts', () => {
    const { container } = render(
      <SeriesBox
        seriesTitle="React Tutorial"
        posts={mockPosts}
      />
    );

    const links = container.querySelectorAll('a');
    // Should have links to each post (no series link in this case)
    expect(links.length).toBeGreaterThanOrEqual(3);
  });

  it('should apply custom className', () => {
    render(
      <SeriesBox
        seriesTitle="React Tutorial"
        posts={mockPosts}
        className="custom-class"
      />
    );

    expect(screen.getByTestId('series-box')).toHaveClass('custom-class');
  });

  it('should handle empty posts array gracefully', () => {
    render(
      <SeriesBox
        seriesTitle="React Tutorial"
        posts={[]}
      />
    );

    expect(screen.getByTestId('series-box')).toBeInTheDocument();
    expect(screen.getByTestId('series-posts')).toBeInTheDocument();
  });

  it('should handle single post', () => {
    render(
      <SeriesBox
        seriesTitle="React Tutorial"
        posts={[mockPosts[0]]}
        currentPostId="post-1"
      />
    );

    expect(screen.getByTestId('series-post-post-1')).toBeInTheDocument();
    expect(screen.getByTestId('series-progress-text')).toHaveTextContent('100%');
  });
});
