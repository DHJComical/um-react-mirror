/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import url from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import replace from '@rollup/plugin-replace';
import topLevelAwait from 'vite-plugin-top-level-await';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';

import { tryCommand } from './support/command';
import { base64Loader } from './support/b64-loader';
import { macCommandLoader } from './support/mac-command-loader';

const projectRoot = url.fileURLToPath(new URL('.', import.meta.url));
const pkg = JSON.parse(fs.readFileSync(projectRoot + '/package.json', 'utf-8'));

const COMMAND_GIT_VERSION = 'git describe --long --dirty --tags --always';
const shortCommit = process.env.GIT_COMMIT || tryCommand(COMMAND_GIT_VERSION, __dirname, 'unknown');
const version = `${pkg.version} (${shortCommit})`;

export default defineConfig({
  base: '/um-react-mirror/',

  worker: {
    format: 'es',
  },
  server: {
    fs: {
      allow: [
        'index.html',
        'src',
        'node_modules',
        process.env.LIB_UM_WASM_LOADER_DIR || '../lib_um_crypto_rust/um_wasm_loader',
      ],
    },
  },
  optimizeDeps: {
    exclude: ['@unlock-music/crypto', 'sql.js'],
  },
  plugins: [
    tailwindcss(),
    base64Loader,
    macCommandLoader,
    replace({
      preventAssignment: true,
      values: {
        __APP_VERSION_SHORT__: pkg.version,
        __APP_VERSION__: version,
      },
    }),
    react(),
    wasm(),
    topLevelAwait(),
    VitePWA({
      registerType: 'prompt',
      scope: '/um-react-mirror/',
      base: '/um-react-mirror/',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm,webp}'],
        navigateFallback: null,
      },
      manifest: {
        display: 'standalone',
        name: '音乐解锁 (Unlock Music)',
        short_name: '音乐解锁',
        lang: 'zh-cmn-Hans-CN',
        description: '在现代浏览器解锁已购的加密音乐！',
        theme_color: '#ffffff',
        start_url: '/um-react-mirror/',
        scope: '/um-react-mirror/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      '@sql-wasm': path.resolve(__dirname, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
      module: path.resolve(__dirname, 'src', 'dummy.mjs'),
    },
  },
  build: {
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          core: ['react', 'react-dom'],
          router: ['react-router', 'react-router-dom'],
          store: ['react-redux', '@reduxjs/toolkit'],
          extras: ['react-dropzone', 'react-toastify'],
        },
      },
    },
  },
  test: {
    globals: true,
    mockReset: true,
    environment: 'jsdom',
    setupFiles: ['src/test-utils/setup-jest.ts'],
    deps: {
      optimizer: {
        web: {
          include: ['sql.js'],
        },
      },
    },
    api: {
      port: 5174,
    },
    coverage: {
      provider: 'v8',
      exclude: [
        'coverage/**',
        'dist/**',
        'packages/*/test{,s}/**',
        '**/*.d.ts',
        'cypress/**',
        'test{,s}/**',
        'test{,-*}.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}',
        '**/__tests__/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/.{eslint,mocha,prettier}rc.{js,cjs,yml}',
        'src/test-utils/**',
      ],
    },
  },
});
