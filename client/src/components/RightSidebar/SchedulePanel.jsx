import { useSocket } from '../../context/SocketContext';
import { EVENTS } from '../../constants';

export function SchedulePanel({ state }) {
  const socket = useSocket();

  const handleBufferToggle = () => {
    socket.emit(EVENTS.BUFFER_UPDATE, {
      settings: {
        ...state.bufferSettings,
        enabled: !state.bufferSettings.enabled,
      },
    });
  };

  const handleBufferDurationChange = (e) => {
    socket.emit(EVENTS.BUFFER_UPDATE, {
      settings: {
        ...state.bufferSettings,
        durationSec: Math.max(0, parseInt(e.target.value) || 300),
      },
    });
  };

  const handleBufferActionChange = (action) => {
    socket.emit(EVENTS.BUFFER_UPDATE, {
      settings: {
        ...state.bufferSettings,
        action,
      },
    });
  };

  const handleAccentColorChange = (color) => {
    socket.emit(EVENTS.ACCENT_SET, { color });
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-4">
      {/* Buffer settings */}
      <div>
        <p className="text-2xs font-semibold uppercase tracking-widest text-text-muted mb-2">
          Buffer Settings
        </p>
        
        <label className="flex items-center gap-2 text-xs text-text-muted-2 cursor-pointer hover:text-text mb-2">
          <input
            type="checkbox"
            checked={state.bufferSettings.enabled}
            onChange={handleBufferToggle}
            className="w-3.5 h-3.5"
          />
          Enable buffer
        </label>

        {state.bufferSettings.enabled && (
          <>
            <div className="mb-3">
              <label className="text-2xs text-text-muted block mb-1">
                Duration (seconds)
              </label>
              <input
                type="number"
                value={state.bufferSettings.durationSec}
                onChange={handleBufferDurationChange}
                className="w-full bg-surface-3 border border-border-2 rounded px-2 py-1.5 text-xs text-text font-mono outline-none focus:border-accent focus:border-opacity-35 transition-colors"
              />
            </div>

            <div>
              <label className="text-2xs text-text-muted block mb-1">
                After buffer expires
              </label>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs text-text-muted-2 cursor-pointer hover:text-text">
                  <input
                    type="radio"
                    name="buffer-action"
                    checked={state.bufferSettings.action === 'pause'}
                    onChange={() => handleBufferActionChange('pause')}
                    className="w-3.5 h-3.5"
                  />
                  Pause
                </label>
                <label className="flex items-center gap-2 text-xs text-text-muted-2 cursor-pointer hover:text-text">
                  <input
                    type="radio"
                    name="buffer-action"
                    checked={state.bufferSettings.action === 'next'}
                    onChange={() => handleBufferActionChange('next')}
                    className="w-3.5 h-3.5"
                  />
                  Auto-advance
                </label>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Accent color */}
      <div>
        <p className="text-2xs font-semibold uppercase tracking-widest text-text-muted mb-2">
          Accent Color
        </p>
        <div className="grid grid-cols-6 gap-1.5">
          {['#e8ff6b', '#f5ff8a', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map((color) => (
            <button
              key={color}
              onClick={() => handleAccentColorChange(color)}
              className={`w-full aspect-square rounded-md border-2 transition-all ${
                state.accentColor === color
                  ? 'border-accent shadow-lg'
                  : 'border-border-2 hover:border-border'
              }`}
              style={{ backgroundColor: color }}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
}
