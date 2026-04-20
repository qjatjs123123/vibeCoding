import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('should render skeleton with default rect variant', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('div');

    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('rounded-lg');
  });

  it('should render text skeleton', () => {
    const { container } = render(<Skeleton variant="text" />);
    const skeleton = container.querySelector('div');

    expect(skeleton).toHaveClass('h-4', 'rounded');
  });

  it('should render circle skeleton', () => {
    const { container } = render(<Skeleton variant="circle" />);
    const skeleton = container.querySelector('div');

    expect(skeleton).toHaveClass('rounded-full', 'w-10', 'h-10');
  });

  it('should render multiple skeletons', () => {
    const { container } = render(<Skeleton count={3} />);
    // The structure is: outer div (space-y-2) > 3 inner divs
    const skeletonsWrapper = container.querySelector('div.space-y-2');
    const skeletons = skeletonsWrapper?.querySelectorAll(':scope > div');

    expect(skeletons).toHaveLength(3);
  });

  it('should accept custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    expect(container.querySelector('div')).toHaveClass('custom-class');
  });

  it('should have animate-pulse class for loading effect', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('div');

    expect(skeleton).toHaveClass('animate-pulse');
  });
});
