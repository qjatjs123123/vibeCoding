import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagList } from './TagList';

describe('TagList', () => {
  const mockTags = [
    { name: 'react', count: 42 },
    { name: 'typescript', count: 28 },
    { name: 'testing', count: 15 },
  ];

  const mockOnTagClick = vi.fn();
  const mockOnTagRemove = vi.fn();

  it('should render list of tags', () => {
    render(<TagList tags={mockTags} />);

    expect(screen.getByTestId('tag-list')).toBeInTheDocument();
    expect(screen.getByTestId('tag-name-react')).toBeInTheDocument();
    expect(screen.getByTestId('tag-name-typescript')).toBeInTheDocument();
    expect(screen.getByTestId('tag-name-testing')).toBeInTheDocument();
  });

  it('should show empty message when tags is empty', () => {
    render(<TagList tags={[]} />);

    expect(screen.getByTestId('tag-list-empty')).toBeInTheDocument();
    expect(screen.getByText('태그가 없습니다.')).toBeInTheDocument();
  });

  it('should show custom empty message', () => {
    render(
      <TagList
        tags={[]}
        emptyMessage="No tags available"
      />
    );

    expect(screen.getByText('No tags available')).toBeInTheDocument();
  });

  it('should display tag counts', () => {
    render(<TagList tags={mockTags} />);

    expect(screen.getByTestId('tag-count-react')).toHaveTextContent('(42)');
    expect(screen.getByTestId('tag-count-typescript')).toHaveTextContent('(28)');
    expect(screen.getByTestId('tag-count-testing')).toHaveTextContent('(15)');
  });

  it('should call onTagClick when tag is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TagList
        tags={mockTags}
        onTagClick={mockOnTagClick}
      />
    );

    const reactTag = screen.getByTestId('tag-badge-react');
    await user.click(reactTag);

    expect(mockOnTagClick).toHaveBeenCalledWith('react');
  });

  it('should limit tags with maxTags', () => {
    render(
      <TagList
        tags={mockTags}
        maxTags={2}
      />
    );

    expect(screen.getByTestId('tag-name-react')).toBeInTheDocument();
    expect(screen.getByTestId('tag-name-typescript')).toBeInTheDocument();
    expect(screen.queryByTestId('tag-name-testing')).not.toBeInTheDocument();
  });

  it('should show hidden count badge', () => {
    render(
      <TagList
        tags={mockTags}
        maxTags={2}
      />
    );

    expect(screen.getByTestId('tag-list-hidden-count')).toHaveTextContent('+1');
  });

  it('should generate correct hrefs when basePath is provided', () => {
    render(
      <TagList
        tags={mockTags}
        basePath="/tags/"
      />
    );

    expect(screen.getByTestId('tag-badge-link-react')).toHaveAttribute(
      'href',
      '/tags/react'
    );
    expect(screen.getByTestId('tag-badge-link-typescript')).toHaveAttribute(
      'href',
      '/tags/typescript'
    );
  });

  it('should show remove buttons when removable is true', () => {
    render(
      <TagList
        tags={mockTags}
        removable={true}
      />
    );

    expect(screen.getByTestId('tag-remove-react')).toBeInTheDocument();
    expect(screen.getByTestId('tag-remove-typescript')).toBeInTheDocument();
    expect(screen.getByTestId('tag-remove-testing')).toBeInTheDocument();
  });

  it('should call onTagRemove when remove is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TagList
        tags={mockTags}
        removable={true}
        onTagRemove={mockOnTagRemove}
      />
    );

    const removeButton = screen.getByTestId('tag-remove-react');
    await user.click(removeButton);

    expect(mockOnTagRemove).toHaveBeenCalledWith('react');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <TagList
        tags={mockTags}
        className="custom-class"
      />
    );

    expect(screen.getByTestId('tag-list')).toHaveClass('custom-class');
  });

  it('should apply size and variant props', () => {
    render(
      <TagList
        tags={mockTags}
        size="sm"
        variant="outline"
      />
    );

    // 태그들이 정상적으로 렌더링되는지 확인
    expect(screen.getByTestId('tag-list')).toBeInTheDocument();
    expect(screen.getByTestId('tag-name-react')).toBeInTheDocument();
  });

  it('should handle tags without count', () => {
    const tagsWithoutCount = [
      { name: 'react' },
      { name: 'typescript' },
    ];

    render(<TagList tags={tagsWithoutCount} />);

    expect(screen.getByTestId('tag-name-react')).toBeInTheDocument();
    expect(screen.queryByTestId('tag-count-react')).not.toBeInTheDocument();
  });

  it('should handle single tag', () => {
    render(
      <TagList
        tags={[{ name: 'react', count: 42 }]}
      />
    );

    expect(screen.getByTestId('tag-list')).toBeInTheDocument();
    expect(screen.getByTestId('tag-name-react')).toBeInTheDocument();
    expect(screen.queryByTestId('tag-list-hidden-count')).not.toBeInTheDocument();
  });

  it('should handle maxTags equal to tag length', () => {
    render(
      <TagList
        tags={mockTags}
        maxTags={3}
      />
    );

    expect(screen.getByTestId('tag-name-react')).toBeInTheDocument();
    expect(screen.getByTestId('tag-name-typescript')).toBeInTheDocument();
    expect(screen.getByTestId('tag-name-testing')).toBeInTheDocument();
    expect(screen.queryByTestId('tag-list-hidden-count')).not.toBeInTheDocument();
  });
});
