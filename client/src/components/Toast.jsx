import { useState, useEffect } from 'react';
import { useToastQueue } from '../hooks/useToast';

export function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return useToastQueue(setToasts);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="bg-green text-bg px-4 py-2 rounded-lg shadow-lg animate-slide-up pointer-events-auto"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
