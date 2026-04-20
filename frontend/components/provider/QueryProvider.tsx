'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// 싱글톤 QueryClient 인스턴스
let clientQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: 매번 새로운 인스턴스 생성
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5분
          gcTime: 1000 * 60 * 30, // 30분
        },
      },
    });
  } else {
    // Client: 싱글톤 재사용
    if (!clientQueryClient)
      clientQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
          },
        },
      });
    return clientQueryClient;
  }
}

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
