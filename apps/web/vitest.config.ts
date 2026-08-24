import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      include: ['src/app/auth/callback/redirect.ts', 'src/components/home-view.tsx'],
      exclude: ['src/**/*.test.*'],
      all: true,
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ticker-journal/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
});
