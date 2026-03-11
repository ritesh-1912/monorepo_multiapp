import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.tsx',
    toast: 'src/toast-client.tsx',
  },
  format: ['cjs', 'esm'],
  dts: true,
  external: ['react', 'react-dom'],
});
