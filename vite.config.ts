import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, loadEnv, type Plugin } from 'vite';
/// <reference types="vitest" />

/**
 * Vite dev-only plugin: handles POST /api/chat inside the Vite dev server.
 * Eliminates the need to run a separate Express process during development.
 * The same logic runs via Express (server/index.js) in production.
 */
function devChatPlugin(apiKey: string): Plugin {
  return {
    name: 'dev-chat-api',
    configureServer(server) {
      server.middlewares.use(
        '/api/chat',
        async (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          try {
            // Collect request body
            const chunks: Buffer[] = [];
            for await (const chunk of req) chunks.push(chunk as Buffer);
            const body = JSON.parse(Buffer.concat(chunks).toString());
            const { message, history = [], sessionId } = body;

            if (typeof message !== 'string' || !message.trim()) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'message is required' }));
              return;
            }

            // Dynamic import keeps @google/genai out of the browser bundle
            const { streamChat } = await import('./server/chatHandler.js');

            // Set SSE headers before streaming
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            // res.flushHeaders(); // Not available in some node http versions/Vite envs

            await streamChat({
              message: message.trim(),
              history,
              apiKey,
              sessionId: sessionId ?? null,
              write: (chunk: string) => res.write(chunk),
            });

            res.end();
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            console.error('[dev-chat-api]', message);
            if (!res.headersSent) {
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'AI service unavailable — try again shortly' }));
            } else {
              // streamChat already wrote an error SSE event — just end cleanly
              res.end();
            }
          }
        },
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', ''); // '' prefix loads ALL vars, not just VITE_
  const apiKey = env.GEMINI_API_KEY;

  if (mode === 'development' && !apiKey) {
    console.warn(
      '\n⚠  GEMINI_API_KEY is not set — chatbot will return errors in dev.\n' +
      '   Add it to a .env file:\n' +
      '   GEMINI_API_KEY=your-key-here\n',
    );
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Only active during `npm run dev` — not included in production bundle
      ...(apiKey ? [devChatPlugin(apiKey)] : []),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
            'vendor-motion': ['motion'],
            'vendor-charts': ['recharts', 'd3'],
            'vendor-markdown': ['react-markdown', 'remark-gfm'],
          },
        },
      },
    },
    define: {
      'process.env.APP_URL': JSON.stringify(env.VITE_APP_URL),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: [],
      exclude: ['**/node_modules/**', '**/*.contract.test.*', '**/e2e/**'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // /api/chat is handled by devChatPlugin above — no proxy needed.
      // /admin kept in case a local admin server is running.
      proxy: {
        '/admin': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  };
});
