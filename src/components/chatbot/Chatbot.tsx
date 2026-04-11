import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useChat } from '../../hooks/useChat';
import { trackEvent } from '../../utils/analytics';
import { ChatWindow } from './ChatWindow';

export function Chatbot({ navVisible = false }: { navVisible?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { messages, isStreaming, error, sendMessage, clearError, clearHistory } = useChat();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    trackEvent('Chatbot', 'Toggle', next ? 'open' : 'close');
  };

  // Determine bottom position based on screen size and nav visibility
  const baseBottom = 24;
  const navOffset = isMobile && navVisible ? 72 : 0; // Standardize offset to match nav height
  const bottom = baseBottom + navOffset;

  return (
    <>
      <motion.button
        onClick={toggle}
        title="Ask Eduardo's AI"
        animate={{ bottom }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="terminal-glow fixed right-6 z-50 flex items-center justify-center cursor-pointer"
        style={{
          width: 60,
          height: 60,
          background: '#050505',
          border: '1px solid #00FFFF',
          borderRadius: 4,
          fontFamily: 'var(--font-mono)',
          fontSize: 18,
          color: '#00FFFF',
          letterSpacing: 1,
        }}
      >
        {'>_'}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            messages={messages}
            isStreaming={isStreaming}
            error={error}
            onSend={sendMessage}
            onClose={toggle}
            onClearError={clearError}
            onClearHistory={clearHistory}
          />
        )}
      </AnimatePresence>
    </>
  );
}
