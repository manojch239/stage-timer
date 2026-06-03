import { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { EVENTS } from '../../constants';
import { RundownItem } from './RundownItem';
import { BufferItem } from './BufferItem';

export function LeftSidebar({ rundown, activeIndex, bufferSettings }) {
  const socket = useSocket();
  const [isImporting, setIsImporting] = useState(false);

  const handleImportCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result;
      if (typeof csv !== 'string') return;

      const lines = csv.split('\n').filter(line => line.trim());
      const items = lines.slice(1).map((line, idx) => {
        const [title, speaker, duration] = line.split(',').map(s => s.trim());
        return {
          title: title || `Item ${idx + 1}`,
          speaker: speaker || '',
          duration: parseInt(duration) || 300,
        };
      });

      items.forEach(item => {
        socket.emit(EVENTS.RUNDOWN_ADD, { item });
      });
    };
    reader.readAsText(file);
    setIsImporting(false);
  };

  const handleAddTimer = () => {
    socket.emit(EVENTS.RUNDOWN_ADD, {
      item: {
        title: 'New Timer',
        speaker: '',
        duration: 300,
      },
    });
  };

  return (
    <div className="w-67 border-r border-border bg-surface flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3.5 py-3 border-b border-border flex items-center justify-between shrink-0">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Rundown
        </h3>
        <div className="flex gap-1">
          <button className="w-6 h-6 rounded border border-border-2 bg-transparent hover:bg-surface-3 text-text-muted hover:text-text flex items-center justify-center transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button className="w-6 h-6 rounded border border-border-2 bg-transparent hover:bg-surface-3 text-text-muted hover:text-text flex items-center justify-center transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Import button */}
      <label className="mx-2.5 mt-2 mb-0 flex items-center gap-1.5 px-2.5 py-1.75 rounded-3 border border-dashed border-border-2 bg-transparent hover:bg-surface-2 hover:border-border text-text-muted-2 hover:text-text font-light text-xs cursor-pointer transition-all shrink-0">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
        </svg>
        Import CSV rundown
        <input
          type="file"
          accept=".csv"
          onChange={handleImportCSV}
          className="hidden"
          disabled={isImporting}
        />
      </label>

      {/* Rundown list */}
      <div className="flex-1 overflow-y-auto px-2 py-1.5">
        {rundown.length === 0 ? (
          <div className="text-xs text-text-muted-2 text-center py-8">
            No items in rundown
          </div>
        ) : (
          rundown.map((item, index) => (
            <div key={item.id || index}>
              <RundownItem
                item={item}
                index={index}
                isActive={index === activeIndex}
              />
              {bufferSettings.enabled && index < rundown.length - 1 && (
                <BufferItem duration={bufferSettings.durationSec} />
              )}
            </div>
          ))
        )}
      </div>

      {/* Add timer button */}
      <button
        onClick={handleAddTimer}
        className="mx-2 mb-2 px-2 py-2 rounded-3 border border-dashed border-border-2 bg-transparent hover:bg-surface-2 text-text-muted font-light text-xs flex items-center justify-center gap-1.5 transition-all shrink-0"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add timer
      </button>
    </div>
  );
}
