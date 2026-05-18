// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true, // Enables describe, test, it, expect without manual imports
    environment: 'node', // Matches your Node.js runtime environment
    include: ['**/*.test.ts'], // Matches your original testMatch configuration
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['json-summary', 'text', 'lcov'],
      include: ['src/**']
    }
  }
})
