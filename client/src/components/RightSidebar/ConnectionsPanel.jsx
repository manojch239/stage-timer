import { useToast } from '../../hooks/useToast';

export function ConnectionsPanel({ connections }) {
  const { toast } = useToast();

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast(`${label} copied to clipboard`);
    });
  };

  const viewerUrl = `${window.location.origin}/viewer`;
  const controllerUrl = window.location.origin;

  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-4">
      {/* Connected viewers */}
      <div>
        <p className="text-2xs font-semibold uppercase tracking-widest text-text-muted mb-2">
          Connected Viewers ({connections?.count || 0})
        </p>
        {connections?.count > 0 ? (
          <p className="text-xs text-text-muted-2">
            {connections.count} viewer{connections.count === 1 ? '' : 's'} connected
          </p>
        ) : (
          <p className="text-xs text-text-muted-2">No viewers connected</p>
        )}
      </div>

      {/* Share links */}
      <div>
        <p className="text-2xs font-semibold uppercase tracking-widest text-text-muted mb-2">
          Share Links
        </p>

        <div className="space-y-2">
          {/* Controller link */}
          <div>
            <label className="text-2xs text-text-muted block mb-1">Controller</label>
            <div className="flex gap-1">
              <input
                type="text"
                readOnly
                value={controllerUrl}
                className="flex-1 bg-surface-3 border border-border-2 rounded px-2 py-1.5 text-xs text-text-muted-2 font-mono outline-none"
              />
              <button
                onClick={() => copyToClipboard(controllerUrl, 'Controller link')}
                className="px-2.5 py-1.5 rounded bg-surface-3 border border-border-2 hover:bg-surface text-text-muted hover:text-text text-xs cursor-pointer transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Viewer link */}
          <div>
            <label className="text-2xs text-text-muted block mb-1">Viewer</label>
            <div className="flex gap-1">
              <input
                type="text"
                readOnly
                value={viewerUrl}
                className="flex-1 bg-surface-3 border border-border-2 rounded px-2 py-1.5 text-xs text-text-muted-2 font-mono outline-none"
              />
              <button
                onClick={() => copyToClipboard(viewerUrl, 'Viewer link')}
                className="px-2.5 py-1.5 rounded bg-surface-3 border border-border-2 hover:bg-surface text-text-muted hover:text-text text-xs cursor-pointer transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
