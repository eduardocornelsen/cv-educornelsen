import { useRef, useEffect, useState, type KeyboardEvent } from 'react';
import { motion } from 'motion/react';
import { X, Trash2 } from 'lucide-react';
import type { Message } from '../../hooks/useChat';
import { ChatMessage, TypingIndicator } from './ChatMessage';

interface Props {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  onSend: (text: string) => void;
  onClose: () => void;
  onClearError: () => void;
  onClearHistory: () => void;
}

export function ChatWindow({ messages, isStreaming, error, onSend, onClose, onClearError, onClearHistory }: Props) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput('');
    onSend(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed z-[100] flex flex-col overflow-hidden bg-[#050505] border border-[#00FFFF] shadow-[0_0_40px_rgba(0,255,255,0.15),0_0_80px_rgba(0,255,255,0.05)] inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[380px] md:h-[520px] md:rounded-lg"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Scan-line overlay */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, background: 'repeating-linear-gradient(0deg,transparent,transparent 4px,rgba(0,0,0,0.04) 4px,rgba(0,0,0,0.04) 8px)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, height: 8, zIndex: 2, pointerEvents: 'none', background: 'linear-gradient(180deg,transparent,rgba(0,255,255,0.04),transparent)', animation: 'scan-line 4s linear infinite' }} />

      {/* Header */}
      <div style={{ background: '#0A0F0A', borderBottom: '1px solid rgba(0,255,255,0.3)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 3, flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: '#00FFFF', letterSpacing: 2 }}>EDUARDO.AI // v1.5</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClearHistory} title="Clear history" style={{ background: 'transparent', border: '1px solid rgba(0,255,255,0.2)', borderRadius: 2, padding: '4px 8px', color: '#00BFBF', cursor: 'pointer' }}>
            <Trash2 size={14} />
          </button>
          <button onClick={onClose} style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#00BFBF', background: 'transparent', border: '1px solid rgba(0,255,255,0.3)', borderRadius: 2, padding: '4px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <X size={14} /> close
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', zIndex: 3, scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,255,255,0.2) transparent' }}>
        {messages.length === 0 && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#00BFBF', padding: '12px 0', lineHeight: 1.8 }}>
            <span style={{ color: '#00FFFF' }}>$ </span>Initializing EduardoAI...<br />
            <span style={{ color: '#00FFFF' }}>$ </span><span style={{ color: '#10B981' }}>Core systems online. Connection established. [OK]</span><br />
            <span style={{ color: '#00FFFF' }}>$ </span>Ask me about Eduardo's experience, projects, or skills.<br />
            <span style={{ animation: 'cursor-blink 0.6s step-end infinite', display: 'inline-block', width: 8, height: 14, background: '#00FFFF', marginTop: 8 }} />
          </div>
        )}
        {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: 'rgba(255,48,80,0.1)', borderTop: '1px solid rgba(255,48,80,0.4)', padding: '8px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#FF3050', zIndex: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          {error}
          <button onClick={onClearError} style={{ color: '#FF3050', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12 }}>[x]</button>
        </div>
      )}

      {/* Input bar */}
      <div style={{ background: '#0A0F0A', borderTop: '1px solid rgba(0,255,255,0.2)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, zIndex: 3, flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#00FFFF', flexShrink: 0 }}>{'>'}</span>
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="type your question..." maxLength={500} disabled={isStreaming} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: 15, color: '#D4D4D4', caretColor: '#00FFFF' }} />
        <button onClick={handleSend} disabled={isStreaming || !input.trim()} style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: input.trim() && !isStreaming ? '#00FFFF' : '#005050', background: 'transparent', border: `1px solid ${input.trim() && !isStreaming ? 'rgba(0,255,255,0.5)' : 'rgba(0,80,80,0.5)'}`, borderRadius: 2, padding: '5px 14px', cursor: input.trim() && !isStreaming ? 'pointer' : 'not-allowed', transition: 'all 0.15s', flexShrink: 0 }}>SEND</button>
      </div>
    </motion.div>
  );
}
