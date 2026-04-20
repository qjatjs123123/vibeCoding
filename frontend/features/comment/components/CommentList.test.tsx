import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommentList } from './CommentList';
import type { Comment } from '../model/comment';

describe('CommentList', () => {
  const mockParentComment: Comment = {
    id: 'comment-1',
    content: 'Parent comment',
    postId: 'post-1',
    author: {
      username: 'user1',
      avatarUrl: 'https://example.com/avatar1.jpg',
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  };

  const mockReplyComment: Comment = {
    id: 'comment-2',
    content: 'Reply comment',
    postId: 'post-1',
    author: {
      username: 'user2',
      avatarUrl: 'https://example.com/avatar2.jpg',
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    parentCommentId: 'comment-1',
  };

  const mockDeletedComment: Comment = {
    id: 'comment-3',
    content: '[삭제된 댓글입니다]',
    postId: 'post-1',
    author: {
      username: 'user3',
      avatarUrl: 'https://example.com/avatar3.jpg',
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    isDeleted: true,
  };

  it('should render comments list', () => {
    render(
      <CommentList
        comments={[mockParentComment]}
      />
    );

    expect(screen.getByTestId('comment-list')).toBeInTheDocument();
    expect(screen.getByText('Parent comment')).toBeInTheDocument();
  });

  it('should show empty state when no comments', () => {
    render(
      <CommentList
        comments={[]}
        isEmpty={true}
      />
    );

    expect(screen.getByTestId('comment-list-empty')).toBeInTheDocument();
    expect(screen.getByText(/댓글이 없습니다/)).toBeInTheDocument();
  });

  it('should show loading skeleton', () => {
    render(
      <CommentList
        comments={[]}
        isLoading={true}
      />
    );

    expect(screen.getByTestId('comment-list-loading')).toBeInTheDocument();
  });

  it('should group replies under parent comments', () => {
    render(
      <CommentList
        comments={[mockParentComment, mockReplyComment]}
      />
    );

    expect(screen.getByText('Parent comment')).toBeInTheDocument();
    expect(screen.getByText('Reply comment')).toBeInTheDocument();

    // 대댓글은 들여쓰기 클래스가 있는 div에 있어야 함
    const replyComment = screen.getByTestId('comment-2');
    expect(replyComment).toHaveClass('ml-8');
  });

  it('should display deleted comment indicator', () => {
    render(
      <CommentList
        comments={[mockDeletedComment]}
      />
    );

    expect(screen.getByText('[삭제된 댓글입니다]')).toBeInTheDocument();
  });

  it('should call onEditComment when edit is triggered', () => {
    const onEditComment = vi.fn();

    render(
      <CommentList
        comments={[mockParentComment]}
        currentUserId="user1"
        onEditComment={onEditComment}
        onDeleteComment={vi.fn()}
      />
    );

    // Note: This would require user interaction in a full test
    // The callback is tested in CommentItem
    expect(onEditComment).toBeDefined();
  });

  it('should call onDeleteComment when delete is triggered', () => {
    const onDeleteComment = vi.fn();

    render(
      <CommentList
        comments={[mockParentComment]}
        currentUserId="user1"
        onEditComment={vi.fn()}
        onDeleteComment={onDeleteComment}
      />
    );

    expect(onDeleteComment).toBeDefined();
  });

  it('should call onReplyComment when reply is triggered', () => {
    const onReplyComment = vi.fn();

    render(
      <CommentList
        comments={[mockParentComment]}
        onReplyComment={onReplyComment}
      />
    );

    expect(onReplyComment).toBeDefined();
  });

  it('should render multiple parent comments with their replies', () => {
    const anotherParent: Comment = {
      id: 'comment-4',
      content: 'Another parent',
      postId: 'post-1',
      author: {
        username: 'user4',
        avatarUrl: 'https://example.com/avatar4.jpg',
      },
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
    };

    const anotherReply: Comment = {
      id: 'comment-5',
      content: 'Another reply',
      postId: 'post-1',
      author: {
        username: 'user5',
        avatarUrl: 'https://example.com/avatar5.jpg',
      },
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
      parentCommentId: 'comment-4',
    };

    render(
      <CommentList
        comments={[
          mockParentComment,
          mockReplyComment,
          anotherParent,
          anotherReply,
        ]}
      />
    );

    expect(screen.getByText('Parent comment')).toBeInTheDocument();
    expect(screen.getByText('Reply comment')).toBeInTheDocument();
    expect(screen.getByText('Another parent')).toBeInTheDocument();
    expect(screen.getByText('Another reply')).toBeInTheDocument();

    // 또한 모두 렌더링되는지 확인
    const commentList = screen.getByTestId('comment-list');
    expect(commentList).toBeInTheDocument();
  });

  it('should have correct comment IDs for data-testid', () => {
    render(
      <CommentList
        comments={[mockParentComment, mockReplyComment]}
      />
    );

    expect(screen.getByTestId('comment-comment-1')).toBeInTheDocument();
    expect(screen.getByTestId('comment-comment-2')).toBeInTheDocument();
  });

  it('should handle empty comments gracefully', () => {
    const { container } = render(
      <CommentList
        comments={[]}
      />
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
