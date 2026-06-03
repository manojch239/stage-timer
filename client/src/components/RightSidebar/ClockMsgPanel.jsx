import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { EVENTS } from '../../constants';

export function ClockMsgPanel({ messages }) {
  const socket = useSocket();
  const [time, setTime] = useState(new Date());
  const [show24h, setShow24h] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = () => {
    let hours = time.getHours();
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const seconds = String(time.getSeconds()).padStart(2, '0');

    if (!show24h) {
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const timeStr = `${hours}:${minutes}${showSeconds ? ':' + seconds : ''} ${period}`;
      return timeStr;
    }

    return `${String(hours).padStart(2, '0')}:${minutes}${showSeconds ? ':' + seconds : ''}`;
  };

  const formatDate = () => {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return time.toLocaleDateString('en-US', options);
  };

  const handleClearMessages = () => {
    socket.emit(EVENTS.MESSAGE_CLEAR);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Wall Clock */}
      <div className="px-4 py-4 border-b border-border flex-shrink-0">
        <p className="text-2xs font-semibold uppercase tracking-widest text-text-muted mb-3">
          Wall Clock
        </p>
        <div className="flex flex-col items-center justify-center py-6">
          <div className="text-5xl font-light font-mono tracking-tight text-text mb-1 break-words">
            {formatTime()}
          </div>
          {showDate && (
            <p className="text-xs text-text-muted">
              {formatDate()}
            </p>
          )}
        </div>
      </div>

      {/* Clock settings */}
      <div className="px-4 py-3 border-b border-border bg-surface-2 flex-shrink-0">
        <p className="text-2xs font-semibold uppercase tracking-widest text-text-muted mb-2">
          Customize Display
        </p>
        <div className="flex flex-wrap gap-1.5">
          <label className={`px-2.5 py-1 rounded-md border text-xs cursor-pointer transition-colors ${show24h ? 'bg-accent-dim-2 border-accent border-opacity-25 text-accent' : 'border-border-2 text-text-muted-2 hover:text-text'}`}>
            <input
              type="checkbox"
              checked={show24h}
              onChange={(e) => setShow24h(e.target.checked)}
              className="hidden"
            />
            24h
          </label>
          <label className={`px-2.5 py-1 rounded-md border text-xs cursor-pointer transition-colors ${!show24h ? 'bg-accent-dim-2 border-accent border-opacity-25 text-accent' : 'border-border-2 text-text-muted-2 hover:text-text'}`}>
            <input
              type="checkbox"
              checked={!show24h}
              onChange={() => setShow24h(false)}
              className="hidden"
            />
            12h
          </label>
          <label className={`px-2.5 py-1 rounded-md border text-xs cursor-pointer transition-colors ${showSeconds ? 'bg-accent-dim-2 border-accent border-opacity-25 text-accent' : 'border-border-2 text-text-muted-2 hover:text-text'}`}>
            <input
              type="checkbox"
              checked={showSeconds}
              onChange={(e) => setShowSeconds(e.target.checked)}
              className="hidden"
            />
            Seconds
          </label>
          <label className={`px-2.5 py-1 rounded-md border text-xs cursor-pointer transition-colors ${showDate ? 'bg-accent-dim-2 border-accent border-opacity-25 text-accent' : 'border-border-2 text-text-muted-2 hover:text-text'}`}>
            <input
              type="checkbox"
              checked={showDate}
              onChange={(e) => setShowDate(e.target.checked)}
              className="hidden"
            />
            Date
          </label>
          <label className="w-full px-2.5 py-1 rounded-md border border-border-2 bg-surface-3 text-xs text-text cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="hidden"
            />
            Local time
          </label>
        </div>
      </div>

      {/* Message log */}
      <div className="px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-2xs font-semibold uppercase tracking-widest text-text-muted">
            Message Log
          </p>
          {messages.length > 0 && (
            <button
              onClick={handleClearMessages}
              className="text-2xs text-text-muted hover:text-text cursor-pointer transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5">
        {messages.length === 0 ? (
          <p className="text-xs text-text-muted-2 italic">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="text-xs text-text-muted-2 p-2.5 rounded-2 bg-surface-2 border border-border"
            >
              <p className="text-text break-words">{msg.text}</p>
              <p className="text-2xs text-text-muted mt-0.5">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
