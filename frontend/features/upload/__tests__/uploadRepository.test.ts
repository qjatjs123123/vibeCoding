import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadRepository } from '../repository/uploadRepository';
import type { AxiosInstance } from 'axios';

describe('UploadRepository', () => {
  let mockAxios: AxiosInstance;
  let repo: UploadRepository;

  beforeEach(() => {
    mockAxios = {
      post: vi.fn(),
      get: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    } as any;

    repo = new UploadRepository(mockAxios);
  });

  describe('uploadImage', () => {
    it('should upload image and return URL', async () => {
      const mockFile = new File(['mock content'], 'test.jpg', {
        type: 'image/jpeg',
      });

      vi.mocked(mockAxios.post).mockResolvedValueOnce({
        data: { url: 'https://example.com/uploaded-image.jpg' },
      } as any);

      const result = await repo.uploadImage(mockFile);

      expect(result.url).toBe('https://example.com/uploaded-image.jpg');
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/upload',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    });

    it('should throw Unauthorized on 401', async () => {
      const mockFile = new File(['mock content'], 'test.jpg');
      const error = new Error('Unauthorized');
      (error as any).response = { status: 401 };

      vi.mocked(mockAxios.post).mockRejectedValueOnce(error);

      await expect(repo.uploadImage(mockFile)).rejects.toThrow(
        'Unauthorized'
      );
    });

    it('should throw File too large on 413', async () => {
      const mockFile = new File(['mock content'], 'test.jpg');
      const error = new Error('File too large');
      (error as any).response = { status: 413 };

      vi.mocked(mockAxios.post).mockRejectedValueOnce(error);

      await expect(repo.uploadImage(mockFile)).rejects.toThrow(
        'File too large'
      );
    });

    it('should throw Unsupported file type on 415', async () => {
      const mockFile = new File(['mock content'], 'test.txt');
      const error = new Error('Unsupported file type');
      (error as any).response = { status: 415 };

      vi.mocked(mockAxios.post).mockRejectedValueOnce(error);

      await expect(repo.uploadImage(mockFile)).rejects.toThrow(
        'Unsupported file type'
      );
    });

    it('should throw error on network failure', async () => {
      const mockFile = new File(['mock content'], 'test.jpg');

      vi.mocked(mockAxios.post).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(repo.uploadImage(mockFile)).rejects.toThrow();
    });
  });
});
