import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should render different variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button', { name: /primary/i });
    expect(button).toHaveClass('bg-blue-600');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button', { name: /danger/i })).toHaveClass('bg-red-600');
  });

  it('should render different sizes', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole('button', { name: /large/i });
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /click/i }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should show loading state', () => {
    render(<Button isLoading>Submit</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should disable button when disabled prop is true', async () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();

    const user = userEvent.setup();
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should accept custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
