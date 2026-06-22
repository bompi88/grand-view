import type { DocumentId } from '@gv/shared';
import type { SyncProvider } from '@gv/sync-providers';
import { useWorkspace, type SyncMode } from '../providers/WorkspaceContext.js';
import { useProviderStatus } from '../hooks/useProviderStatus.js';

/** Per-document sync transport picker + live connection status indicator. */
export function SyncMenu({
  id,
  provider,
  onReload,
}: {
  id: DocumentId;
  provider?: SyncProvider;
  onReload: () => void;
}) {
  const ws = useWorkspace();
  const status = useProviderStatus(provider);
  const mode = ws.getSyncMode(id);

  return (
    <div className="gv-sync" title={`Connection: ${status}`}>
      <span className={`gv-dot gv-dot-${status}`} data-testid="sync-status" aria-label={status} />
      <select
        className="gv-select"
        data-testid="sync-mode"
        value={mode}
        onChange={(e) => {
          ws.setSyncMode(id, e.target.value as SyncMode);
          onReload();
        }}
      >
        <option value="local">Local only</option>
        <option value="p2p">Live · P2P</option>
        <option value="relay" disabled={!ws.relayConfigured}>
          Live · Relay{ws.relayConfigured ? '' : ' (set URL)'}
        </option>
      </select>
    </div>
  );
}
