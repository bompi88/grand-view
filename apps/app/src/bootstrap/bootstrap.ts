import { createWebAdapter } from '@gv/adapter-web';
import type { PlatformAdapter } from '@gv/platform-adapters';
import type { Workspace } from '@gv/ui';
import { createLocalWorkspace } from './workspace.js';

export interface BootContext {
  adapter: PlatformAdapter;
  workspace: Workspace;
}

/** Detect which shell the same web app is running inside. */
function detectPlatform(): PlatformAdapter['platform'] {
  const w = globalThis as unknown as {
    __TAURI_INTERNALS__?: unknown;
    Capacitor?: { isNativePlatform?: () => boolean };
  };
  if (w.__TAURI_INTERNALS__) return 'tauri';
  if (w.Capacitor?.isNativePlatform?.()) return 'capacitor';
  return 'web';
}

/**
 * App bootstrap: build the platform adapter and a local-first workspace
 * (library + per-document persistence), shared by the web, Tauri and
 * Capacitor shells. Phase 2 swaps in native adapters + live sync providers.
 */
export async function bootstrap(): Promise<BootContext> {
  const adapter = createWebAdapter(detectPlatform());
  const workspace = await createLocalWorkspace();
  return { adapter, workspace };
}
