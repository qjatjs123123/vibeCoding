'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { TagBadge } from './TagBadge';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  className?: string;
}

/**
 * 태그 입력 컴포넌트
 * - 쉼표 또는 엔터로 태그 추가
 * - 중복 방지
 * - 최대 10개 제한
 */
export function TagInput({
  tags,
  onTagsChange,
  maxTags = 10,
  className = '',
}: TagInputProps) {
  const [input, setInput] = useState('');

  const handleAddTag = () => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return;

    // 중복 확인
    if (tags.includes(trimmed)) {
      setInput('');
      return;
    }

    // 최대 개수 확인
    if (tags.length >= maxTags) {
      return;
    }

    onTagsChange([...tags, trimmed]);
    setInput('');
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      e.preventDefault();
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Tags ({tags.length}/{maxTags})
      </label>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Tag (press Enter or comma)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={tags.length >= maxTags}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:disabled:bg-slate-900"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={handleAddTag}
          disabled={!input.trim() || tags.length >= maxTags}
        >
          Add
        </Button>
      </div>

      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge
              key={tag}
              name={tag}
              removable
              onRemove={() => handleRemoveTag(tag)}
              variant="default"
            />
          ))}
        </div>
      )}

      {tags.length >= maxTags && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          최대 {maxTags}개까지 추가 가능합니다
        </p>
      )}
    </div>
  );
}
