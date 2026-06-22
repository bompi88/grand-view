import { useEffect, useState } from 'react';
import type { ConnectionStatus } from '@gv/shared';
import type { SyncProvider } from '@gv/sync-providers';

/** Reactive connection status of a sync provider. */
export function useProviderStatus(provider?: SyncProvider): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>(provider?.status() ?? 'disconnected');
  useEffect(() => {
    if (!provider) {
      setStatus('disconnected');
      return;
    }
    setStatus(provider.status());
    return provider.onStatus(setStatus);
  }, [provider]);
  return status;
}
