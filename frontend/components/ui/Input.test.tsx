import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('should render input field', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument();
  });

  it('should render with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
  });

  it('should display helper text', () => {
    render(<Input helperText="Enter at least 8 characters" />);
    expect(screen.getByText(/enter at least 8 characters/i)).toBeInTheDocument();
  });

  it('should not show helper text when error is present', () => {
    render(
      <Input
        error="Error message"
        helperText="Helper text"
      />
    );
    expect(screen.queryByText(/helper text/i)).not.toBeInTheDocument();
    expect(screen.getByText(/error message/i)).toBeInTheDocument();
  });

  it('should handle input changes', async () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input') as HTMLInputElement;

    const user = userEvent.setup();
    await user.type(input, 'test value');

    expect(input.value).toBe('test value');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should accept custom className', () => {
    render(<Input className="custom-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });

  it('should have focus ring on focus', async () => {
    render(<Input />);
    const input = screen.getByRole('textbox');

    const user = userEvent.setup();
    await user.click(input);

    expect(input).toHaveFocus();
  });
});
