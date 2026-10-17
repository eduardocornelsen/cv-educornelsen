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
  const baseBottom = isMobile ? 16 : 24;
  const navOffset = isMobile && navVisible ? 64 : 0; // Height of the mobile section bar
  const bottom = baseBottom + navOffset;

  return (
    <>
      <motion.button
        onClick={toggle}
        title="Ask Eduardo's AI"
        aria-label="Open the chat assistant"
        animate={{ bottom }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-4 md:right-6 z-50 flex items-center justify-center cursor-pointer hover:bg-zinc-900 transition-colors"
        style={{
          width: isMobile ? 46 : 52,
          height: isMobile ? 46 : 52,
          background: '#09090b',
          border: '1px solid rgba(52, 211, 153, 0.6)',
          borderRadius: 10,
          fontFamily: 'var(--font-mono)',
          fontSize: isMobile ? 15 : 16,
          color: '#34d399',
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
