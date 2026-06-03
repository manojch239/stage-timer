import { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { EVENTS } from '../../constants';

export function MessagePanel({ messages }) {
  const socket = useSocket();
  const [messageText, setMessageText] = useState('');
  const [justSent, setJustSent] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!messageText.trim()) return;
    socket.emit(EVENTS.MESSAGE_SEND, { text: messageText });
    setMessageText('');
    setJustSent(true);
    setTimeout(() => setJustSent(false), 200);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border px-5 py-2.75 bg-surface flex-shrink-0 flex items-center gap-2">
      <p className="text-2xs font-semibold uppercase tracking-widest text-text-muted flex-shrink-0">
        Message
      </p>
      <input
        type="text"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Send a message to the stage..."
        className="flex-1 bg-surface-2 border border-border-2 rounded-2 px-3 py-1.5 text-xs text-text placeholder-text-muted outline-none focus:border-accent focus:border-opacity-35 transition-colors"
      />
      <button
        onClick={handleSend}
        disabled={!messageText.trim()}
        className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all flex-shrink-0 ${
          justSent || !messageText.trim()
            ? 'bg-surface-3 text-text-muted border border-border-2'
            : 'bg-accent text-bg border-accent hover:bg-accent-dim'
        }`}
      >
        Send
      </button>
    </div>
  );
}
