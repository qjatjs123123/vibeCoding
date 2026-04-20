import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentItem } from './CommentItem';
import type { Comment } from '../model/comment';

describe('CommentItem', () => {
  const mockComment: Comment = {
    id: 'comment-1',
    content: 'This is a test comment',
    postId: 'post-1',
    author: {
      username: 'testuser',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  };

  const mockDeletedComment: Comment = {
    ...mockComment,
    id: 'comment-2',
    isDeleted: true,
    content: '[삭제된 댓글입니다]',
  };

  const mockReplyComment: Comment = {
    ...mockComment,
    id: 'reply-1',
    content: 'This is a reply',
    parentCommentId: 'comment-1',
  };

  it('should render comment content', () => {
    render(<CommentItem comment={mockComment} />);

    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
  });

  it('should display author username and avatar', () => {
    render(<CommentItem comment={mockComment} />);

    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('should display formatted date', () => {
    render(<CommentItem comment={mockComment} />);

    const dateText = screen.getByText(/2024/);
    expect(dateText).toBeInTheDocument();
  });

  it('should show deleted comment text for soft-deleted comments', () => {
    render(<CommentItem comment={mockDeletedComment} />);

    expect(screen.getByText('[삭제된 댓글입니다]')).toBeInTheDocument();
  });

  it('should show Edit and Delete buttons for owner', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <CommentItem
        comment={mockComment}
        isOwner={true}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('should not show Edit and Delete buttons for non-owner', () => {
    render(
      <CommentItem
        comment={mockComment}
        isOwner={false}
      />
    );

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('should call onEdit when Edit button is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <CommentItem
        comment={mockComment}
        isOwner={true}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith('comment-1');
  });

  it('should call onDelete when Delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <CommentItem
        comment={mockComment}
        isOwner={true}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith('comment-1');
  });

  it('should show Reply button for parent comments', () => {
    render(
      <CommentItem
        comment={mockComment}
        isReply={false}
      />
    );

    expect(screen.getByRole('button', { name: /reply/i })).toBeInTheDocument();
  });

  it('should not show Reply button for reply comments', () => {
    render(
      <CommentItem
        comment={mockReplyComment}
        isReply={true}
      />
    );

    expect(screen.queryByRole('button', { name: /reply/i })).not.toBeInTheDocument();
  });

  it('should call onReply when Reply button is clicked', async () => {
    const user = userEvent.setup();
    const onReply = vi.fn();

    render(
      <CommentItem
        comment={mockComment}
        isReply={false}
        onReply={onReply}
      />
    );

    const replyButton = screen.getByRole('button', { name: /reply/i });
    await user.click(replyButton);

    expect(onReply).toHaveBeenCalledWith('comment-1');
  });

  it('should have reply indentation class', () => {
    const { container } = render(
      <CommentItem
        comment={mockReplyComment}
        isReply={true}
      />
    );

    const replyDiv = container.firstChild;
    expect(replyDiv).toHaveClass('ml-8');
  });

  it('should disable Edit button for deleted comments', () => {
    render(
      <CommentItem
        comment={mockDeletedComment}
        isOwner={true}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeDisabled();
  });
});
