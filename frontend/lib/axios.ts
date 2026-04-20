import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true, // 쿠키 포함
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - Authorization 토큰 추가
axiosInstance.interceptors.request.use(
  config => {
    const session = useAuthStore.getState().session;
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 인증 만료 처리
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
