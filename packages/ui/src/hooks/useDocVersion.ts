import { useCallback, useSyncExternalStore } from 'react';
import type * as Y from 'yjs';

/**
 * Returns a monotonically increasing version that bumps on every Y.Doc update.
 * Use it as a dependency to memoize derived selector output (e.g. buildTree),
 * which keeps snapshots referentially stable between actual changes.
 */
export function useDocVersion(doc: Y.Doc): number {
  const subscribe = useCallback(
    (onChange: () => void) => {
      doc.on('afterTransaction', onChange);
      return () => doc.off('afterTransaction', onChange);
    },
    [doc],
  );
  // The store value is the doc's internal logical clock, which advances on change.
  const getSnapshot = useCallback(() => {
    let sum = 0;
    doc.store.clients.forEach((items) => {
      const last = items[items.length - 1];
      if (last) sum += last.id.clock + last.length;
    });
    return sum;
  }, [doc]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
