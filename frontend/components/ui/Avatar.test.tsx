import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('should render avatar with initials', () => {
    render(<Avatar alt="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should render avatar with image', () => {
    render(
      <Avatar
        src="https://example.com/avatar.jpg"
        alt="John Doe"
      />
    );
    const img = screen.getByAltText('John Doe');
    expect(img).toBeInTheDocument();
  });

  it('should render avatar with custom fallback', () => {
    render(
      <Avatar
        alt="User"
        fallback="AB"
      />
    );
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('should render different sizes', () => {
    const { rerender } = render(<Avatar alt="User" size="sm" />);
    let avatar = screen.getByTitle('User');
    expect(avatar).toHaveClass('w-8', 'h-8');

    rerender(<Avatar alt="User" size="lg" />);
    avatar = screen.getByTitle('User');
    expect(avatar).toHaveClass('w-12', 'h-12');
  });

  it('should accept custom className', () => {
    render(
      <Avatar
        alt="User"
        className="border-2 border-blue-500"
      />
    );
    expect(screen.getByTitle('User')).toHaveClass('border-2', 'border-blue-500');
  });

  it('should generate initials from alt text correctly', () => {
    const { rerender } = render(<Avatar alt="Alice Bob Charlie" />);
    expect(screen.getByText('AB')).toBeInTheDocument();

    rerender(<Avatar alt="XYZ" />);
    expect(screen.getByText('X')).toBeInTheDocument();
  });
});
