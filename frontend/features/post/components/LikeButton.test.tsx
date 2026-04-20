import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LikeButton } from './LikeButton';

describe('LikeButton', () => {
  const mockOnToggle = vi.fn();
  const mockOnLoginRequired = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render like button', () => {
      render(
        <LikeButton
          postId="post-1"
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByTestId('like-button')).toBeInTheDocument();
    });

    it('should display initial count', () => {
      render(
        <LikeButton
          postId="post-1"
          initialCount={5}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByTestId('like-count')).toHaveTextContent('5');
    });

    it('should not display count when it is 0', () => {
      render(
        <LikeButton
          postId="post-1"
          initialCount={0}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByTestId('like-count')).toHaveTextContent('');
    });

    it('should show heart icon as filled when liked', () => {
      const { container } = render(
        <LikeButton
          postId="post-1"
          initialLiked={true}
          onToggle={mockOnToggle}
        />
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('fill-current');
    });

    it('should show heart icon as outline when not liked', () => {
      const { container } = render(
        <LikeButton
          postId="post-1"
          initialLiked={false}
          onToggle={mockOnToggle}
        />
      );

      const svg = container.querySelector('svg');
      expect(svg).not.toHaveClass('fill-current');
    });
  });

  describe('Authentication', () => {
    it('should disable button when currentUserId is not provided', () => {
      render(
        <LikeButton
          postId="post-1"
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByTestId('like-button');
      expect(button).toBeDisabled();
    });

    it('should call onLoginRequired when not authenticated', async () => {
      const user = userEvent.setup();

      render(
        <LikeButton
          postId="post-1"
          onToggle={mockOnToggle}
          onLoginRequired={mockOnLoginRequired}
        />
      );

      const button = screen.getByTestId('like-button');
      await user.click(button);

      expect(mockOnLoginRequired).toHaveBeenCalledOnce();
      expect(mockOnToggle).not.toHaveBeenCalled();
    });

    it('should enable button when currentUserId is provided', () => {
      render(
        <LikeButton
          postId="post-1"
          currentUserId="user1"
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByTestId('like-button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Like Toggle', () => {
    it('should call onToggle with postId and new liked status', async () => {
      const user = userEvent.setup();

      mockOnToggle.mockResolvedValueOnce({ liked: true });

      render(
        <LikeButton
          postId="post-1"
          currentUserId="user1"
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByTestId('like-button');
      await user.click(button);

      expect(mockOnToggle).toHaveBeenCalledWith('post-1', true);
    });

    it('should toggle like state on click', async () => {
      const user = userEvent.setup();

      mockOnToggle.mockResolvedValueOnce({ liked: true });

      render(
        <LikeButton
          postId="post-1"
          initialLiked={false}
          currentUserId="user1"
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByTestId('like-button');
      expect(button).toHaveAttribute('aria-pressed', 'false');

      await user.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should update count optimistically when liking', async () => {
      const user = userEvent.setup();

      mockOnToggle.mockResolvedValueOnce({ liked: true });

      render(
        <LikeButton
          postId="post-1"
          initialCount={5}
          initialLiked={false}
          currentUserId="user1"
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByTestId('like-button');
      await user.click(button);

      // 낙관적 업데이트: 즉시 증가
      expect(screen.getByTestId('like-count')).toHaveTextContent('6');
    });

    it('should update count optimistically when unliking', async () => {
      const user = userEvent.setup();

      mockOnToggle.mockResolvedValueOnce({ liked: false });

      render(
        <LikeButton
          postId="post-1"
          initialCount={5}
          initialLiked={true}
          currentUserId="user1"
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByTestId('like-button');
      await user.click(button);

      // 낙관적 업데이트: 즉시 감소
      expect(screen.getByTestId('like-count')).toHaveTextContent('4');
    });

    it('should prevent multiple clicks while loading', async () => {
      const user = userEvent.setup();

      let resolveToggle: () => void;
      const togglePromise = new Promise<{ liked: boolean }>((resolve) => {
        resolveToggle = resolve;
      });

      mockOnToggle.mockReturnValueOnce(togglePromise);

      render(
        <LikeButton
          postId="post-1"
          currentUserId="user1"
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByTestId('like-button');
      await user.click(button);

      // 로딩 중에 다시 클릭 시도
      await user.click(button);

      // onToggle이 한 번만 호출되어야 함
      expect(mockOnToggle).toHaveBeenCalledTimes(1);

      resolveToggle!();
    });
  });

  describe('Error Handling', () => {
    it('should display error message on failure', async () => {
      const user = userEvent.setup();

      const error = new Error('Network error');
      mockOnToggle.mockRejectedValueOnce(error);

      render(
        <LikeButton
          postId="post-1"
          currentUserId="user1"
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByTestId('like-button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('like-error')).toHaveTextContent('Network error');
      });
    });

    it('should rollback optimistic update on error', async () => {
      const user = userEvent.setup();

      mockOnToggle.mockRejectedValueOnce(new Error('Server error'));

      render(
        <LikeButton
          postId="post-1"
          initialCount={5}
          initialLiked={false}
          currentUserId="user1"
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByTestId('like-button');
      await user.click(button);

      // 일시적으로 6으로 증가했다가
      expect(screen.getByTestId('like-count')).toHaveTextContent('6');

      // 에러 후 다시 5로 복구
      await waitFor(() => {
        expect(screen.getByTestId('like-count')).toHaveTextContent('5');
      });

      // 버튼 상태도 원래대로
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should show generic error message when error has no message', async () => {
      const user = userEvent.setup();

      mockOnToggle.mockRejectedValueOnce(new Error());

      render(
        <LikeButton
          postId="post-1"
          currentUserId="user1"
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByTestId('like-button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('like-error')).toHaveTextContent(
          '좋아요 처리에 실패했습니다.'
        );
      });
    });
  });

  describe('Initialization', () => {
    it('should update liked state when initialLiked changes', () => {
      const { rerender } = render(
        <LikeButton
          postId="post-1"
          initialLiked={false}
          currentUserId="user1"
          onToggle={mockOnToggle}
        />
      );

      let button = screen.getByTestId('like-button');
      expect(button).toHaveAttribute('aria-pressed', 'false');

      rerender(
        <LikeButton
          postId="post-1"
          initialLiked={true}
          currentUserId="user1"
          onToggle={mockOnToggle}
        />
      );

      button = screen.getByTestId('like-button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should update count when initialCount changes', () => {
      const { rerender } = render(
        <LikeButton
          postId="post-1"
          initialCount={5}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByTestId('like-count')).toHaveTextContent('5');

      rerender(
        <LikeButton
          postId="post-1"
          initialCount={10}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByTestId('like-count')).toHaveTextContent('10');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria attributes when liked', () => {
      render(
        <LikeButton
          postId="post-1"
          initialLiked={true}
          currentUserId="user1"
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByTestId('like-button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveAttribute('aria-label', '좋아요 취소');
    });

    it('should have proper aria attributes when not liked', () => {
      render(
        <LikeButton
          postId="post-1"
          initialLiked={false}
          currentUserId="user1"
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByTestId('like-button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).toHaveAttribute('aria-label', '좋아요');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(
        <LikeButton
          postId="post-1"
          onToggle={mockOnToggle}
          className="custom-class"
        />
      );

      expect(screen.getByTestId('like-button-container')).toHaveClass('custom-class');
    });
  });
});
