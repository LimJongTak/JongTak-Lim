import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** 미리보기(아티팩트) 빌드: 서버 없이 동작, 상대 경로, 청크 하나로 */
export default defineConfig({
  plugins: [react()],
  base: './',
  define: { 'import.meta.env.VITE_DEMO': JSON.stringify('1') },
  build: {
    outDir: 'dist-preview',
    emptyOutDir: true,
    copyPublicDir: false,
    assetsInlineLimit: 0,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
