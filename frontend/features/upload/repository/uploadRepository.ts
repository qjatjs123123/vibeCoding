import { AxiosInstance, isAxiosError } from 'axios';

export interface UploadResponse {
  url: string;
}

export class UploadRepository {
  constructor(private axiosInstance: AxiosInstance) {}

  async uploadImage(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await this.axiosInstance.post<UploadResponse>(
        '/api/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return data;
    } catch (error) {
      throw this.handleError(error, 'Failed to upload image');
    }
  }

  private handleError(error: unknown, message: string): Error {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized');
      }
      if (error.response?.status === 413) {
        throw new Error('File too large');
      }
      if (error.response?.status === 415) {
        throw new Error('Unsupported file type');
      }
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(message);
  }
}
