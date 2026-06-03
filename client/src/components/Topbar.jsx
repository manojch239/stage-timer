import { useToast } from '../hooks/useToast';

export function Topbar({ roomId, connectedCount }) {
  const { toast } = useToast();

  const handleShareLinks = () => {
    const viewerUrl = `${window.location.origin}/viewer?room=${roomId}`;
    navigator.clipboard.writeText(viewerUrl).then(() => {
      toast('Viewer link copied to clipboard');
    });
  };

  return (
    <div className="h-12 flex items-center px-4 border-b border-border gap-0 bg-bg">
      {/* Logo */}
      <div className="flex items-center gap-2 pr-5 border-r border-border">
        <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center text-bg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 5v14m7-7H5" />
          </svg>
        </div>
        <span className="text-xs font-semibold tracking-tight">Cueflow</span>
      </div>

      {/* Room info */}
      <div className="flex items-center gap-1.5 px-4 text-sm text-text-muted-2">
        <span>Product Launch · Room {roomId || 'PLX-09'}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <div className="text-xs bg-surface-3 border border-border px-2 py-1 rounded-full text-text-muted-2">
          <span className="text-green font-medium">{connectedCount}</span>
          <span> connected</span>
        </div>

        <button
          onClick={handleShareLinks}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-accent/25 rounded-md bg-accent-dim-2 hover:bg-accent/10 text-xs text-accent transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-5.316l6.632-3.316" />
          </svg>
          Share links
        </button>
      </div>
    </div>
  );
}
