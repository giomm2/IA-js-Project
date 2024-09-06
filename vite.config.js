import { defineConfig } from 'vite';
export default defineConfig({
  base: '/src/ai/',
  plugins: [],
  esbuild: {
    supported: {
      'top-level-await': true //browsers can handle top-level-await features
    },
  }
})