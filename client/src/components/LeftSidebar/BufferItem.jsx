export function BufferItem({ duration }) {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 px-2.5 py-1.25 mb-0.5 rounded bg-transparent border border-dashed border-border-2 border-opacity-25">
      <svg className="w-3.5 h-3.5 opacity-30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <p className="text-2xs text-text-muted font-light italic flex-1">
        Buffer
      </p>
      <span className="font-mono text-2xs text-text-muted bg-surface-3 px-1.25 py-0.25 rounded flex-shrink-0">
        {formatDuration(duration)}
      </span>
    </div>
  );
}
