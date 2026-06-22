import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Workspace packages publish raw TypeScript via their "exports" map. Exclude them
// from dep pre-bundling so Vite transforms them through its normal TS pipeline.
const gvPackages = [
  '@gv/shared',
  '@gv/core',
  '@gv/ui',
  '@gv/platform-adapters',
  '@gv/adapter-web',
  '@gv/sync-providers',
];

export default defineConfig({
  plugins: [react()],
  optimizeDeps: { exclude: gvPackages },
  // Tauri expects a fixed port and no clearing of the screen on dev.
  clearScreen: false,
  server: { port: 5173, strictPort: true },
  build: { target: 'es2022', outDir: 'dist', emptyOutDir: true },
});
