import { describe, it, expect } from 'vitest';
import { generateSlug } from './slug';

describe('generateSlug', () => {
  it('should convert title to lowercase', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(generateSlug('Next JS Guide')).toBe('next-js-guide');
  });

  it('should handle korean characters', () => {
    expect(generateSlug('안녕하세요 NextJS')).toBe('안녕하세요-nextjs');
  });

  it('should remove special characters', () => {
    expect(generateSlug('Hello, World!')).toBe('hello-world');
  });

  it('should collapse multiple spaces', () => {
    expect(generateSlug('Hello   World')).toBe('hello-world');
  });

  it('should handle leading/trailing spaces', () => {
    expect(generateSlug('  Hello World  ')).toBe('hello-world');
  });

  it('should remove leading/trailing hyphens', () => {
    expect(generateSlug('-hello-world-')).toBe('hello-world');
  });

  it('should handle empty string', () => {
    expect(generateSlug('')).toBe('');
  });

  it('should handle only special characters', () => {
    expect(generateSlug('!@#$%')).toBe('');
  });

  it('should preserve hyphens in the middle', () => {
    expect(generateSlug('hello-world-guide')).toBe('hello-world-guide');
  });
});
