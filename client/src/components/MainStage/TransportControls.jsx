import { useSocket } from '../../context/SocketContext';
import { EVENTS } from '../../constants';

export function TransportControls({ isPlaying, remaining, totalDuration }) {
  const socket = useSocket();

  const handleToggle = () => {
    socket.emit(EVENTS.TIMER_TOGGLE);
  };

  const handleReset = () => {
    socket.emit(EVENTS.TIMER_RESET);
  };

  const handleAdjust = (seconds) => {
    socket.emit(EVENTS.TIMER_ADJUST, { seconds });
  };

  const handleNext = () => {
    socket.emit(EVENTS.TIMER_NEXT);
  };

  const handlePrev = () => {
    socket.emit(EVENTS.TIMER_PREV);
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      {/* Adjust buttons */}
      <button
        onClick={() => handleAdjust(-60)}
        className="px-2.25 py-1.25 rounded-2 border border-border-2 bg-surface hover:bg-surface-3 text-text cursor-pointer font-mono text-2xs transition-colors"
      >
        -1m
      </button>
      <button
        onClick={() => handleAdjust(-30)}
        className="px-2.25 py-1.25 rounded-2 border border-border-2 bg-surface hover:bg-surface-3 text-text cursor-pointer font-mono text-2xs transition-colors"
      >
        -30s
      </button>

      {/* Skip back */}
      <button
        onClick={handlePrev}
        className="w-9 h-9 rounded-2.5 border border-border-2 bg-surface hover:bg-surface-3 text-text cursor-pointer flex items-center justify-center transition-colors"
      >
        <svg className="w-3.75 h-3.75" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      {/* Reload/Reset */}
      <button
        onClick={handleReset}
        className="w-9 h-9 rounded-2.5 border border-border-2 bg-surface hover:bg-surface-3 text-text cursor-pointer flex items-center justify-center transition-colors"
      >
        <svg className="w-3.75 h-3.75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      {/* Play/Pause */}
      <button
        onClick={handleToggle}
        className={`w-14 h-14 rounded-3.5 border cursor-pointer flex items-center justify-center transition-all ${
          isPlaying
            ? 'bg-surface border-border-2 text-text hover:bg-surface-3'
            : 'bg-accent border-accent text-bg hover:bg-accent-dim shadow-accent-glow'
        }`}
      >
        {isPlaying ? (
          <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-4.5 h-4.5 ml-0.75" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Skip forward */}
      <button
        onClick={handleNext}
        className="w-9 h-9 rounded-2.5 border border-border-2 bg-surface hover:bg-surface-3 text-text cursor-pointer flex items-center justify-center transition-colors"
      >
        <svg className="w-3.75 h-3.75" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 18h2V6h-2zm-11-7l8.5-6v12z" />
        </svg>
      </button>

      {/* Adjust buttons */}
      <button
        onClick={() => handleAdjust(30)}
        className="px-2.25 py-1.25 rounded-2 border border-border-2 bg-surface hover:bg-surface-3 text-text cursor-pointer font-mono text-2xs transition-colors"
      >
        +30s
      </button>
      <button
        onClick={() => handleAdjust(60)}
        className="px-2.25 py-1.25 rounded-2 border border-border-2 bg-surface hover:bg-surface-3 text-text cursor-pointer font-mono text-2xs transition-colors"
      >
        +1m
      </button>
    </div>
  );
}
