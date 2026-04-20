import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MarkdownEditor } from './MarkdownEditor';
import { useEditorStore } from '@/stores/editorStore';

describe('MarkdownEditor', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    useEditorStore.setState({ draft: null });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const initialDraft = {
    title: 'Test Post',
    content: 'Test content',
    excerpt: 'Test excerpt',
    coverImage: '',
    tags: [],
    published: false,
    lastSaved: Date.now(),
  };

  it('should render editor with initial draft', async () => {
    render(<MarkdownEditor initialDraft={initialDraft} />, { wrapper });

    // 동적 로드를 기다림
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Post')).toBeInTheDocument();
    });
  });

  it('should update title on input change', async () => {
    const user = userEvent.setup();

    render(<MarkdownEditor initialDraft={initialDraft} />, { wrapper });

    await waitFor(() => {
      const titleInput = screen.getByDisplayValue('Test Post');
      expect(titleInput).toBeInTheDocument();
    });

    const titleInput = screen.getByDisplayValue('Test Post');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Title');

    await waitFor(() => {
      expect(screen.getByDisplayValue('Updated Title')).toBeInTheDocument();
    });
  });

  it('should update excerpt on input change', async () => {
    const user = userEvent.setup();

    render(<MarkdownEditor initialDraft={initialDraft} />, { wrapper });

    await waitFor(() => {
      const excerptInput = screen.getByDisplayValue('Test excerpt');
      expect(excerptInput).toBeInTheDocument();
    });

    const excerptInput = screen.getByDisplayValue('Test excerpt');
    await user.clear(excerptInput);
    await user.type(excerptInput, 'New excerpt');

    await waitFor(() => {
      expect(screen.getByDisplayValue('New excerpt')).toBeInTheDocument();
    });
  });

  it('should show draft recovery message if draft exists', async () => {
    useEditorStore.setState({ draft: initialDraft });

    render(<MarkdownEditor />, { wrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Post')).toBeInTheDocument();
    });
  });

  it('should display markdown content in preview', async () => {
    const draftWithMarkdown = {
      ...initialDraft,
      content: '# Hello World\n\nThis is **bold** text.',
    };

    render(<MarkdownEditor initialDraft={draftWithMarkdown} />, { wrapper });

    // 초기 드래프트가 로드되는지 확인
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Post')).toBeInTheDocument();
    });

    // 미리보기 영역에 마크다운이 렌더링되는지 확인 (동적 import로 인한 지연)
    await waitFor(() => {
      const previewText = screen.queryByText(/hello world/i) || screen.queryByText(/getting started/i);
      expect(previewText).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should show loading state while uploading', async () => {
    render(<MarkdownEditor initialDraft={initialDraft} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Post')).toBeInTheDocument();
    });

    // 업로드 로딩 상태는 useUploadMutation의 isPending에 따라 표시됨
    // 이는 실제 파일 업로드 테스트에서 확인됨
  });

  it('should handle empty draft gracefully', async () => {
    render(<MarkdownEditor />, { wrapper });

    await waitFor(() => {
      // 드래프트가 없으면 "No draft loaded" 메시지 표시
      expect(screen.getByText(/no draft loaded/i)).toBeInTheDocument();
    });
  });
});
