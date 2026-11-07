import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**',
      '**/.agents/**',
      '**/.claude/**',
      '**/.grok/**',
      '**/dist/**',
      '**/supabase/functions/**',
    ],
  },
});
