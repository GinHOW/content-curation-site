import { defineConfig } from 'vitest/config'
import { CRAP_SOURCE_FILES } from './scripts/crap-modules.mjs'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.mjs'],
    coverage: {
      provider: 'v8',
      include: CRAP_SOURCE_FILES,
      reporter: ['text', 'lcov'],
    },
  },
})
