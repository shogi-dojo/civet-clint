import { defineConfig } from 'vitest/config'
import civetPlugin from '@danielx/civet/vite'

export default defineConfig({
  plugins: [
    civetPlugin({
      ts: 'civet',
      emitDeclaration: false
    })
  ],
  test: {
    include: ['test/**/*.{test,spec}.{js,mjs,ts,civet}']
  }
})
