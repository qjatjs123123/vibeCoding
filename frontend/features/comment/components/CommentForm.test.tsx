import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentForm } from './CommentForm';

describe('CommentForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnLoginRequired = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Required State', () => {
    it('should show login prompt when currentUserId is not provided', () => {
      render(
        <CommentForm
          onSubmit={mockOnSubmit}
          onLoginRequired={mockOnLoginRequired}
        />
      );

      expect(screen.getByTestId('comment-form-login-required')).toBeInTheDocument();
      expect(screen.getByText(/댓글을 작성하려면 로그인이 필요합니다/)).toBeInTheDocument();
    });

    it('should show login button', () => {
      render(
        <CommentForm
          onSubmit={mockOnSubmit}
          onLoginRequired={mockOnLoginRequired}
        />
      );

      const loginButton = screen.getByTestId('comment-form-login-button');
      expect(loginButton).toBeInTheDocument();
      expect(loginButton).toHaveTextContent('로그인');
    });

    it('should call onLoginRequired when login button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <CommentForm
          onSubmit={mockOnSubmit}
          onLoginRequired={mockOnLoginRequired}
        />
      );

      const loginButton = screen.getByTestId('comment-form-login-button');
      await user.click(loginButton);

      expect(mockOnLoginRequired).toHaveBeenCalledOnce();
    });
  });

  describe('Authenticated Form', () => {
    it('should render comment form when currentUserId is provided', () => {
      render(
        <CommentForm
          currentUserId="user1"
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByTestId('comment-form')).toBeInTheDocument();
      expect(screen.getByTestId('comment-form-textarea')).toBeInTheDocument();
    });

    it('should show correct placeholder text for parent comment', () => {
      render(
        <CommentForm
          currentUserId="user1"
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByTestId('comment-form-textarea') as HTMLTextAreaElement;
      expect(textarea.placeholder).toContain('댓글을 입력해주세요');
    });

    it('should show correct placeholder text for reply comment', () => {
      render(
        <CommentForm
          currentUserId="user1"
          parentCommentId="comment-1"
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByTestId('comment-form-textarea') as HTMLTextAreaElement;
      expect(textarea.placeholder).toContain('답글을 입력해주세요');
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with content when form is submitted', async () => {
      const user = userEvent.setup();

      render(
        <CommentForm
          currentUserId="user1"
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByTestId('comment-form-textarea');
      await user.type(textarea, 'This is a test comment');

      const submitButton = screen.getByTestId('comment-form-submit-button');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith('This is a test comment', undefined);
    });

    it('should include parentCommentId when submitting a reply', async () => {
      const user = userEvent.setup();

      render(
        <CommentForm
          currentUserId="user1"
          parentCommentId="comment-1"
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByTestId('comment-form-textarea');
      await user.type(textarea, 'This is a reply');

      const submitButton = screen.getByTestId('comment-form-submit-button');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith('This is a reply', 'comment-1');
    });

    it('should clear textarea after successful submission', async () => {
      const user = userEvent.setup();

      render(
        <CommentForm
          currentUserId="user1"
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByTestId('comment-form-textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Test comment');

      const submitButton = screen.getByTestId('comment-form-submit-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    });

    it('should prevent submission with empty content', async () => {
      const user = userEvent.setup();

      render(
        <CommentForm
          currentUserId="user1"
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByTestId('comment-form-submit-button');
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByTestId('comment-form-error')).toBeInTheDocument();
      expect(screen.getByText('댓글을 입력해주세요.')).toBeInTheDocument();
    });

    it('should show error message on submission failure', async () => {
      const user = userEvent.setup();
      const error = new Error('Network error');
      mockOnSubmit.mockRejectedValueOnce(error);

      render(
        <CommentForm
          currentUserId="user1"
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByTestId('comment-form-textarea');
      await user.type(textarea, 'Test comment');

      const submitButton = screen.getByTestId('comment-form-submit-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('comment-form-error')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should disable submit button during submission', async () => {
      const user = userEvent.setup();
      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });

      mockOnSubmit.mockReturnValueOnce(submitPromise);

      render(
        <CommentForm
          currentUserId="user1"
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByTestId('comment-form-textarea');
      await user.type(textarea, 'Test comment');

      const submitButton = screen.getByTestId('comment-form-submit-button') as HTMLButtonElement;
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('작성 중...');

      resolveSubmit!();

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Cancel Button', () => {
    it('should render cancel button when onCancel is provided', () => {
      render(
        <CommentForm
          currentUserId="user1"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('comment-form-cancel-button')).toBeInTheDocument();
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <CommentForm
          currentUserId="user1"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByTestId('comment-form-cancel-button');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledOnce();
    });

    it('should not render cancel button when onCancel is not provided', () => {
      render(
        <CommentForm
          currentUserId="user1"
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.queryByTestId('comment-form-cancel-button')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and testid attributes', () => {
      render(
        <CommentForm
          currentUserId="user1"
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByTestId('comment-form')).toBeInTheDocument();
      expect(screen.getByTestId('comment-form-textarea')).toBeInTheDocument();
      expect(screen.getByTestId('comment-form-submit-button')).toBeInTheDocument();
    });

    it('should display error with role=alert', () => {
      render(
        <CommentForm
          currentUserId="user1"
          onSubmit={mockOnSubmit}
        />
      );

      // 에러를 트리거합니다
      const submitButton = screen.getByTestId('comment-form-submit-button');
      submitButton.click();

      const errorElement = screen.getByTestId('comment-form-error');
      expect(errorElement).toHaveAttribute('role', 'alert');
    });
  });

  describe('Input Behavior', () => {
    it('should trim whitespace before validation', async () => {
      const user = userEvent.setup();

      render(
        <CommentForm
          currentUserId="user1"
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByTestId('comment-form-textarea');
      await user.type(textarea, '   ');

      const submitButton = screen.getByTestId('comment-form-submit-button');
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByTestId('comment-form-error')).toBeInTheDocument();
    });

    it('should clear error message when user starts typing', async () => {
      const user = userEvent.setup();

      render(
        <CommentForm
          currentUserId="user1"
          onSubmit={mockOnSubmit}
        />
      );

      // First, trigger an error
      const submitButton = screen.getByTestId('comment-form-submit-button');
      await user.click(submitButton);

      expect(screen.getByTestId('comment-form-error')).toBeInTheDocument();

      // Now type something
      const textarea = screen.getByTestId('comment-form-textarea');
      await user.type(textarea, 'Now I have content');

      expect(screen.queryByTestId('comment-form-error')).not.toBeInTheDocument();
    });

    it('should disable submit button when content is empty', async () => {
      const user = userEvent.setup();

      render(
        <CommentForm
          currentUserId="user1"
          onSubmit={mockOnSubmit}
        />
      );

      const textarea = screen.getByTestId('comment-form-textarea');
      const submitButton = screen.getByTestId('comment-form-submit-button') as HTMLButtonElement;

      // Initially disabled (no content)
      expect(submitButton).toBeDisabled();

      // After typing, enabled
      await user.type(textarea, 'Comment');
      expect(submitButton).not.toBeDisabled();

      // After clearing, disabled again
      await user.clear(textarea);
      expect(submitButton).toBeDisabled();
    });
  });
});
