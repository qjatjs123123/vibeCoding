'use client';

import { Suspense, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useUserSeries } from '../state/useSeriesQuery';
import { useCreateSeries } from '../state/useSeriesMutation';
import { Skeleton } from '@/components/ui/Skeleton';

interface SeriesSelectorProps {
  selectedSeriesId?: string;
  selectedSeriesOrder?: number;
  onSeriesChange: (seriesId: string | undefined) => void;
  onSeriesOrderChange: (order: number | undefined) => void;
  username: string;
  className?: string;
}

/**
 * 시리즈 선택 컴포넌트 (에디터용)
 * - 기존 시리즈 선택
 * - 새 시리즈 생성
 * - 포스트 순서 지정
 */
export function SeriesSelector({
  selectedSeriesId,
  selectedSeriesOrder,
  onSeriesChange,
  onSeriesOrderChange,
  username,
  className = '',
}: SeriesSelectorProps) {
  return (
    <Suspense fallback={<SeriesSelectorSkeleton />}>
      <SeriesSelectorContent
        selectedSeriesId={selectedSeriesId}
        selectedSeriesOrder={selectedSeriesOrder}
        onSeriesChange={onSeriesChange}
        onSeriesOrderChange={onSeriesOrderChange}
        username={username}
        className={className}
      />
    </Suspense>
  );
}

function SeriesSelectorContent({
  selectedSeriesId,
  selectedSeriesOrder,
  onSeriesChange,
  onSeriesOrderChange,
  username,
  className = '',
}: SeriesSelectorProps) {
  const { data: seriesList } = useUserSeries(username);
  const { mutate: createSeries, isPending: isCreating } = useCreateSeries();
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState('');

  const handleCreateSeries = () => {
    if (!newSeriesName.trim()) return;

    createSeries(
      { name: newSeriesName },
      {
        onSuccess: (newSeries) => {
          onSeriesChange(newSeries.id);
          onSeriesOrderChange(1);
          setNewSeriesName('');
          setShowNewForm(false);
        },
      }
    );
  };

  const handleClearSeries = () => {
    onSeriesChange(undefined);
    onSeriesOrderChange(undefined);
  };

  const selectedSeries = seriesList?.items.find((s) => s.id === selectedSeriesId);

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Series (Optional)
      </label>

      {/* 선택된 시리즈 표시 */}
      {selectedSeries && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {selectedSeries.name}
            </p>
            {selectedSeriesOrder && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                포스트 #{selectedSeriesOrder}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSeries}
            className="text-slate-600 dark:text-slate-400"
          >
            ✕
          </Button>
        </div>
      )}

      {/* 시리즈 선택 드롭다운 */}
      {!selectedSeries && seriesList && seriesList.items.length > 0 && (
        <select
          value={selectedSeriesId || ''}
          onChange={(e) => {
            const seriesId = e.target.value;
            if (seriesId) {
              onSeriesChange(seriesId);
              onSeriesOrderChange(
                Math.max(
                  ...(seriesList?.items.find((s) => s.id === seriesId)?.postCount || [0])
                ) + 1
              );
            }
          }}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="">선택하지 않음</option>
          {seriesList.items.map((series) => (
            <option key={series.id} value={series.id}>
              {series.name} ({series.postCount || 0} posts)
            </option>
          ))}
        </select>
      )}

      {/* 시리즈 순서 입력 */}
      {selectedSeriesId && (
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Post Order in Series
          </label>
          <input
            type="number"
            min="1"
            value={selectedSeriesOrder || 1}
            onChange={(e) => onSeriesOrderChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      )}

      {/* 새 시리즈 생성 버튼 */}
      {!showNewForm && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNewForm(true)}
          className="w-full text-slate-600 dark:text-slate-400"
        >
          + 새 시리즈 생성
        </Button>
      )}

      {/* 새 시리즈 생성 폼 */}
      {showNewForm && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New series name"
            value={newSeriesName}
            onChange={(e) => setNewSeriesName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateSeries();
              } else if (e.key === 'Escape') {
                setShowNewForm(false);
                setNewSeriesName('');
              }
            }}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateSeries}
            disabled={!newSeriesName.trim() || isCreating}
          >
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowNewForm(false);
              setNewSeriesName('');
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {seriesList && seriesList.items.length === 0 && !showNewForm && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          No series yet. Create one to organize your posts.
        </p>
      )}
    </div>
  );
}

function SeriesSelectorSkeleton() {
  return <Skeleton className="h-32 rounded-lg" />;
}
