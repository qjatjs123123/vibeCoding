import Image from 'next/image';
import React from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: AvatarSize;
  fallback?: string;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const fontSizes: Record<AvatarSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl',
};

function getInitials(text: string): string {
  return text
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ src, alt, size = 'md', fallback, className = '' }: AvatarProps) {
  const displayText = fallback || getInitials(alt);

  return (
    <div
      className={`
        relative flex items-center justify-center
        rounded-full overflow-hidden
        bg-gradient-to-br from-blue-400 to-blue-600
        font-medium text-white
        flex-shrink-0
        ${sizeStyles[size]}
        ${fontSizes[size]}
        ${className}
      `}
      title={alt}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={`${parseInt(sizeStyles[size].split('-')[1])}px`}
        />
      ) : (
        displayText
      )}
    </div>
  );
}
