import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./test/setup.js'],
    globals: true,
    environment: 'jsdom',
    include: ['test/**/*.test.js'],
  },
});
