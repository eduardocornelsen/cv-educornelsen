import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../../hooks/useChat';

interface Props {
  message: Message;
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';
  // If user message, show instantly. If assistant, use typewriter reveal.
  const [displayedContent, setDisplayedContent] = useState(isUser ? message.content : '');
  const [isTyping, setIsTyping] = useState(!isUser);

  // High-Velocity Typewriter (Main aesthetic)
  useEffect(() => {
    if (isUser) return;
    
    // If the content updated (e.g. from a stream), this effect will catch up
    let index = displayedContent.length;
    const timer = setInterval(() => {
      if (index < message.content.length) {
        index++;
        setDisplayedContent(message.content.slice(0, index));
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 8); // Mach-speed: ~125 chars/sec

    return () => clearInterval(timer);
  }, [message.content, isUser, displayedContent.length]);

  if (isUser) {
    return (
      <div className="flex justify-end mb-3">
        <div
          style={{
            background: '#0A1A1A',
            border: '1px solid rgba(0,255,255,0.25)',
            borderRadius: 4,
            maxWidth: '80%',
            padding: '8px 12px',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#00FFFF' }}>{'> '}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#00FFFF' }}>{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-3">
      <div
        style={{
          background: '#050505',
          border: '1px solid rgba(0,255,255,0.12)',
          borderRadius: 4,
          maxWidth: '85%',
          padding: '8px 12px',
        }}
      >
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00BFBF', marginBottom: 4, letterSpacing: 1 }}>
          EDUARDO.AI://
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#D4D4D4', lineHeight: 1.6 }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {displayedContent}
          </ReactMarkdown>
          {isTyping && (
            <span 
              style={{ 
                display: 'inline-block', 
                width: 8, 
                height: 14, 
                background: '#00FFFF', 
                marginLeft: 4,
                verticalAlign: 'middle',
                animation: 'cursor-blink 0.4s step-end infinite'
              }} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div
        style={{
          background: '#050505',
          border: '1px solid rgba(0,255,255,0.12)',
          borderRadius: 4,
          padding: '10px 14px',
        }}
      >
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00BFBF', marginBottom: 6, letterSpacing: 1 }}>
          EDUARDO.AI://
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {[0, 1, 2].map(i => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                width: 10,
                height: 16,
                background: '#00FFFF',
                animation: `cursor-blink 0.6s step-end infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
