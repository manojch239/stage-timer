export function NextStrip({ rundown, activeIndex }) {
  const nextItem = rundown[activeIndex + 1];

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (!nextItem) {
    return (
      <div className="flex items-center gap-2.5 px-4 mx-8 mb-4 bg-surface border border-border rounded-3 flex-shrink-0 h-12">
        <p className="text-2xs font-semibold uppercase tracking-widest text-text-muted flex-shrink-0">
          Next
        </p>
        <p className="text-xs text-text-muted-2">No upcoming items</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 px-4 mx-8 mb-4 bg-surface border border-border rounded-3 flex-shrink-0 h-12">
      <p className="text-2xs font-semibold uppercase tracking-widest text-text-muted flex-shrink-0">
        Next
      </p>
      <p className="text-xs text-text-muted-2 flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
        {nextItem.title}
      </p>
      <span className="font-mono text-xs text-text-muted bg-surface-3 px-1.75 py-0.5 rounded flex-shrink-0">
        {formatDuration(nextItem.duration || 300)}
      </span>
    </div>
  );
}
