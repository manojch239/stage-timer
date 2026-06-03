import { useCallback } from 'react';

let toastQueue = [];
let toastListeners = [];

export function useToast() {
  const toast = useCallback((message) => {
    const id = Date.now();
    toastQueue = [...toastQueue, { id, message }];

    // Notify listeners
    toastListeners.forEach(listener => listener([...toastQueue]));

    // Auto-dismiss after 2200ms
    setTimeout(() => {
      toastQueue = toastQueue.filter(item => item.id !== id);
      toastListeners.forEach(listener => listener([...toastQueue]));
    }, 2200);
  }, []);

  return { toast };
}

export function useToastQueue(onUpdate) {
  if (!toastListeners.includes(onUpdate)) {
    toastListeners.push(onUpdate);
  }

  return () => {
    toastListeners = toastListeners.filter(listener => listener !== onUpdate);
  };
}
