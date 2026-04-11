import { useState, useCallback, useEffect, useRef } from 'react';
import { sanitizeInput, RateLimiter } from '../utils/chatbot';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
}

// ─── Session persistence ──────────────────────────────────────────────────────
const STORAGE_KEY = 'eduardo-chat';

function loadSession(): { messages: Message[]; sessionId: string } {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data.messages) && typeof data.sessionId === 'string') {
        return { messages: data.messages, sessionId: data.sessionId };
      }
    }
  } catch { /* ignore parse errors */ }
  return {
    messages: [],
    sessionId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  };
}

function saveSession(messages: Message[], sessionId: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, sessionId }));
  } catch { /* ignore storage errors */ }
}

const rateLimiter = new RateLimiter();

export function useChat() {
  const initial = loadSession();
  const sessionIdRef = useRef<string>(initial.sessionId);

  const [state, setState] = useState<ChatState>({
    messages: initial.messages,
    isStreaming: false,
    error: null,
  });

  // Persist on message change
  useEffect(() => {
    saveSession(state.messages, sessionIdRef.current);
  }, [state.messages]);

  const sendMessage = useCallback(async (text: string) => {
    const clean = sanitizeInput(text);
    if (!clean) return;

    if (!rateLimiter.check()) {
      setState(s => ({ ...s, error: 'ERR: rate limit exceeded — wait 1 minute' }));
      return;
    }

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: clean,
    };

    const assistantPlaceholder: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: '',
    };

    setState(s => ({
      messages: [...s.messages, userMessage, assistantPlaceholder],
      isStreaming: true,
      error: null,
    }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: clean,
          history: state.messages,
          sessionId: sessionIdRef.current,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      if (!res.body) throw new Error('ReadableStream not supported');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') break;

          try {
            const event = JSON.parse(raw);
            if (event.error) throw new Error(event.error);
            
            if (event.text) {
              if (event.replace) {
                fullContent = event.text;
              } else {
                fullContent += event.text;
              }

              setState(s => {
                const msgs = [...s.messages];
                msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: fullContent };
                return { ...s, messages: msgs };
              });
            }
          } catch (e) {
            if (!(e instanceof SyntaxError)) throw e;
          }
        }
      }
    } catch (err: any) {
      const msg = err?.message ?? 'AI service unavailable';
      setState(s => ({ ...s, error: `ERR: ${msg}` }));
    } finally {
      setState(s => ({ ...s, isStreaming: false }));
    }
  }, [state.messages]);

  const clearError = useCallback(() => setState(s => ({ ...s, error: null })), []);

  const clearHistory = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionIdRef.current = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setState({ messages: [], isStreaming: false, error: null });
  }, []);

  return {
    messages: state.messages,
    isStreaming: state.isStreaming,
    error: state.error,
    sendMessage,
    clearError,
    clearHistory,
  };
}
