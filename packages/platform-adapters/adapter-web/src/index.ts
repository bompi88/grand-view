import { get, set, del, keys } from 'idb-keyval';
import type {
  BlobStoreAdapter,
  ClipboardAdapter,
  DialogAdapter,
  FsAdapter,
  PickedFile,
  PlatformAdapter,
  SaveRequest,
} from '@gv/platform-adapters';

/**
 * Web platform adapter: browser APIs only (File System Access where available,
 * IndexedDB blob store, async clipboard). Used directly in the browser target
 * and as the base inside the Capacitor (mobile) webview.
 */

const BLOB_PREFIX = 'blob:';

const blobStore: BlobStoreAdapter = {
  async put(bytes, mime) {
    const ref = BLOB_PREFIX + crypto.randomUUID();
    await set(ref, { bytes, mime });
    return ref;
  },
  async get(ref) {
    const v = await get<{ bytes: Uint8Array }>(ref);
    if (!v) throw new Error(`blob not found: ${ref}`);
    return v.bytes;
  },
  async delete(ref) {
    await del(ref);
  },
  async url(ref) {
    const v = await get<{ bytes: Uint8Array; mime: string }>(ref);
    if (!v) throw new Error(`blob not found: ${ref}`);
    return URL.createObjectURL(new Blob([v.bytes as BlobPart], { type: v.mime }));
  },
};

const clipboard: ClipboardAdapter = {
  async readText() {
    try {
      return await navigator.clipboard.readText();
    } catch {
      return null;
    }
  },
  async readHtml() {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes('text/html')) {
          const blob = await item.getType('text/html');
          return await blob.text();
        }
      }
    } catch {
      /* not permitted / unsupported */
    }
    return null;
  },
  async readImage() {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imgType = item.types.find((t) => t.startsWith('image/'));
        if (imgType) {
          const blob = await item.getType(imgType);
          return new Uint8Array(await blob.arrayBuffer());
        }
      }
    } catch {
      /* not permitted / unsupported */
    }
    return null;
  },
};

const dialogs: DialogAdapter = {
  async confirm(message) {
    return globalThis.confirm(message);
  },
  async message(message) {
    globalThis.alert(message);
  },
};

const fs: FsAdapter = {
  async appDataDir() {
    return 'idb://gv';
  },
  async readDir() {
    return (await keys()).map(String);
  },
  async readFile(path) {
    const v = await get<Uint8Array>(path);
    if (!v) throw new Error(`not found: ${path}`);
    return v;
  },
  async writeFile(path, bytes) {
    await set(path, bytes);
  },
};

const picker = {
  async openFile(accept?: string[]): Promise<PickedFile | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      if (accept?.length) input.accept = accept.join(',');
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return resolve(null);
        resolve({
          name: file.name,
          mime: file.type,
          bytes: new Uint8Array(await file.arrayBuffer()),
        });
      };
      input.click();
    });
  },
  async saveFile(req: SaveRequest): Promise<void> {
    const url = URL.createObjectURL(new Blob([req.bytes as BlobPart], { type: req.mime }));
    const a = document.createElement('a');
    a.href = url;
    a.download = req.suggestedName;
    a.click();
    URL.revokeObjectURL(url);
  },
};

/**
 * Browser-API adapter. The `platform` tag may be overridden to 'tauri' or
 * 'capacitor' when the same web app runs inside those webviews and is still
 * using browser APIs (native-specific adapters land in Phase 2).
 */
export function createWebAdapter(
  platform: PlatformAdapter['platform'] = 'web',
): PlatformAdapter {
  return {
    platform,
    fs,
    dialogs,
    clipboard,
    blobStore,
    shell: {
      async openExternal(url) {
        globalThis.open(url, '_blank', 'noopener');
      },
    },
    picker,
  };
}
