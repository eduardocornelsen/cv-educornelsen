/**
 * Unit tests for useChat hook.
 * Uses fake timers so drain setIntervals complete instantly via vi.runAllTimersAsync().
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from '../hooks/useChat';

// ── SSE response mock ─────────────────────────────────────────────────────────
function sseResponse(texts: string[]) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const text of texts) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
  return Promise.resolve({ ok: true, body: stream } as Response);
}

function errorResponse(status: number, error: string) {
  return Promise.resolve({
    ok: false,
    status,
    body: null,
    json: () => Promise.resolve({ error }),
  } as Response);
}

// Mock fetch globally — useChat calls /api/chat via SSE
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.useFakeTimers();
    // Default: short response (3 chars) so drain completes quickly
    mockFetch.mockImplementation(() => sseResponse(['Hi!']));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initial state: messages=[], isStreaming=false, error=null', () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toEqual([]);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sendMessage: adds user message immediately', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      const p = result.current.sendMessage('Tell me about Eduardo');
      await vi.runAllTimersAsync();
      await p;
    });

    expect(result.current.messages[0]).toMatchObject({
      role: 'user',
      content: 'Tell me about Eduardo',
    });
  });

  it('sendMessage: appends assistant response on success', async () => {
    mockFetch.mockImplementationOnce(() => sseResponse(['Hello from EduardoAI!']));
    const { result } = renderHook(() => useChat());

    await act(async () => {
      const p = result.current.sendMessage('Tell me about Eduardo');
      await vi.runAllTimersAsync();
      await p;
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]).toMatchObject({
      role: 'assistant',
      content: 'Hello from EduardoAI!',
    });
    expect(result.current.isStreaming).toBe(false);
  });

  it('sendMessage: POSTs to /api/chat with message and history', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      const p = result.current.sendMessage('What projects has Eduardo built?');
      await vi.runAllTimersAsync();
      await p;
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('What projects has Eduardo built?'),
    }));
  });

  it('sendMessage: sets error state on API failure', async () => {
    mockFetch.mockImplementationOnce(() => errorResponse(502, 'API error'));

    const { result } = renderHook(() => useChat());

    await act(async () => {
      const p = result.current.sendMessage('Hello');
      await vi.runAllTimersAsync();
      await p;
    });

    expect(result.current.error).toContain('API error');
    expect(result.current.isStreaming).toBe(false);
  });

  it('sendMessage: rejects with rate limit message when RateLimiter blocks', async () => {
    const { result } = renderHook(() => useChat());

    for (let i = 0; i < 10; i++) {
      await act(async () => {
        const p = result.current.sendMessage(`Message ${i}`);
        await vi.runAllTimersAsync();
        await p;
      });
    }

    await act(async () => {
      const p = result.current.sendMessage('Over the limit');
      await vi.runAllTimersAsync();
      await p;
    });

    expect(result.current.error).toContain('rate limit');
  });

  it('clearError: resets error to null', async () => {
    mockFetch.mockImplementationOnce(() => errorResponse(502, 'oops'));

    const { result } = renderHook(() => useChat());

    await act(async () => {
      const p = result.current.sendMessage('fail');
      await vi.runAllTimersAsync();
      await p;
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
