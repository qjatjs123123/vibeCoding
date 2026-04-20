import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    // Repository 테스트는 node 환경 사용 (DOM 불필요)
    environmentMatchGlobs: [['**/__tests__/**.repository.test.ts', 'node']],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});
