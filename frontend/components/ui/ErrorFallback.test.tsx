import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorFallback } from './ErrorFallback';

describe('ErrorFallback', () => {
  it('should render error message', () => {
    render(<ErrorFallback error="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render default message when no error provided', () => {
    render(<ErrorFallback />);
    expect(screen.getByText(/oops! something went wrong/i)).toBeInTheDocument();
  });

  it('should render error from Error object', () => {
    const error = new Error('Network timeout');
    render(<ErrorFallback error={error} />);
    expect(screen.getByText('Network timeout')).toBeInTheDocument();
  });

  it('should call resetError when button clicked', async () => {
    const resetError = vi.fn();
    render(
      <ErrorFallback
        error="Test error"
        resetError={resetError}
      />
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(resetError).toHaveBeenCalledOnce();
  });

  it('should not render button when resetError is not provided', () => {
    render(<ErrorFallback error="Test error" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should show error details when showDetails is true', () => {
    const error = new Error('Test error with stack');
    const { container } = render(
      <ErrorFallback
        error={error}
        showDetails={true}
      />
    );

    expect(screen.getByText('Test error with stack')).toBeInTheDocument();
    // Check that there's a styled div with the error text
    const detailsDiv = container.querySelector('div[style*="overflow"]') ||
                      container.querySelector('.font-mono');
    expect(detailsDiv).toBeInTheDocument();
  });

  it('should not show stack trace when showDetails is false', () => {
    const error = new Error('Test error');
    const { container } = render(
      <ErrorFallback
        error={error}
        showDetails={false}
      />
    );

    const preElement = container.querySelector('pre');
    expect(preElement).not.toBeInTheDocument();
  });

  it('should render warning icon', () => {
    render(<ErrorFallback error="Test" />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });
});
