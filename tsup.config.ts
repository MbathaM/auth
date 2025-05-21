import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'esnext',
  outDir: 'dist',
  clean: true,
  esbuildOptions(options) {
    options.alias = {
      '@': './src',
    }
  },
})
