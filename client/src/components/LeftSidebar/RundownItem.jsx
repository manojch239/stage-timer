import { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { EVENTS } from '../../constants';

export function RundownItem({ item, index, isActive }) {
  const socket = useSocket();
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title || '');
  const [editSpeaker, setEditSpeaker] = useState(item.speaker || '');
  const [editDuration, setEditDuration] = useState(String(item.duration || 300));

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleSave = () => {
    socket.emit(EVENTS.RUNDOWN_UPDATE, {
      index,
      data: {
        title: editTitle,
        speaker: editSpeaker,
        duration: Math.max(0, parseInt(editDuration) || 300),
      },
    });
    setEditOpen(false);
  };

  const handleCancel = () => {
    setEditTitle(item.title || '');
    setEditSpeaker(item.speaker || '');
    setEditDuration(String(item.duration || 300));
    setEditOpen(false);
  };

  const statusDot = item.status === 'playing' ? 'bg-green animate-pulse' : item.status === 'done' ? 'bg-text-muted' : 'bg-border-2';

  return (
    <div
      className={`group relative flex items-start gap-2.25 px-2.5 py-2.25 rounded-3 cursor-pointer transition-colors mb-0.5 border border-transparent ${
        isActive
          ? 'bg-accent-dim-2 border-accent border-opacity-15'
          : 'hover:bg-surface-2'
      }`}
    >
      {/* Index */}
      <div className={`font-mono text-2xs min-w-4 pt-0.5 flex-shrink-0 ${isActive ? 'text-accent' : 'text-text-muted'}`}>
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.25">
          <p
            className={`text-xs font-medium text-text whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0 ${
              item.status === 'done' ? 'line-through text-text-muted' : ''
            }`}
          >
            {item.title}
          </p>
          <button
            onClick={() => setEditOpen(!editOpen)}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-none border-none text-text-muted hover:text-text cursor-pointer p-0.25 flex items-center flex-shrink-0"
          >
            <svg className="w-2.75 h-2.75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-1.25 mt-0.75">
          {item.speaker && (
            <p className="text-2xs text-text-muted-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-27.5">
              {item.speaker}
            </p>
          )}
          <span className={`font-mono text-2xs px-1.25 py-0.25 rounded flex-shrink-0 ${isActive ? 'bg-accent-dim-2 text-accent' : 'bg-surface-3 text-text-muted-2'}`}>
            {formatDuration(item.duration || 300)}
          </span>
        </div>
      </div>

      {/* Status dot */}
      <div className={`w-1.5 h-1.5 rounded-full mt-1.25 flex-shrink-0 ${statusDot}`}></div>

      {/* Inline edit overlay */}
      {editOpen && (
        <div className="absolute inset-0 bg-surface-2 rounded border border-accent border-opacity-25 z-10 p-2 flex flex-col gap-1.25">
          <div className="flex gap-1.25">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 bg-surface-3 border border-border-2 rounded text-text font-light font-sans text-xs px-2 py-1 outline-none focus:border-accent focus:border-opacity-35"
              placeholder="Title"
            />
          </div>
          <div className="flex gap-1.25">
            <input
              type="text"
              value={editSpeaker}
              onChange={(e) => setEditSpeaker(e.target.value)}
              className="flex-1 bg-surface-3 border border-border-2 rounded text-text font-light font-sans text-xs px-2 py-1 outline-none focus:border-accent focus:border-opacity-35"
              placeholder="Speaker"
            />
          </div>
          <div className="flex gap-1.25">
            <input
              type="number"
              value={editDuration}
              onChange={(e) => setEditDuration(e.target.value)}
              className="w-16 bg-surface-3 border border-border-2 rounded text-text font-mono font-light text-xs px-2 py-1 outline-none focus:border-accent focus:border-opacity-35"
              placeholder="Duration (sec)"
            />
          </div>
          <div className="flex gap-1 justify-end mt-0.5">
            <button
              onClick={handleCancel}
              className="px-2 py-1 rounded text-2xs border border-border-2 bg-transparent text-text-muted-2 hover:bg-surface-3 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-2.5 py-1 rounded text-2xs bg-accent border-none text-bg font-semibold cursor-pointer hover:bg-accent-dim transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
