/**
 * PlatformAdapter — the single seam between the platform-agnostic app and the
 * host (web / Tauri / Capacitor). Everything the legacy app reached for via
 * `_require('electron')` lives behind these interfaces, so `core` and `ui`
 * never import a concrete platform API.
 */

export interface PickedFile {
  name: string;
  mime: string;
  bytes: Uint8Array;
}

export interface SaveRequest {
  suggestedName: string;
  mime: string;
  bytes: Uint8Array;
}

export interface FsAdapter {
  /** App-private data directory (absolute path or opaque handle string). */
  appDataDir(): Promise<string>;
  readDir(path: string): Promise<string[]>;
  readFile(path: string): Promise<Uint8Array>;
  writeFile(path: string, bytes: Uint8Array): Promise<void>;
  /** Watch a path for changes (used by the file-sync provider). Returns an unsubscribe fn. */
  watch?(path: string, onChange: () => void): Promise<() => void>;
  /** Let the user choose a cloud-synced folder (iCloud/Dropbox/…). Null if unsupported/cancelled. */
  pickSyncedFolder?(): Promise<string | null>;
}

export interface DialogAdapter {
  confirm(message: string, title?: string): Promise<boolean>;
  message(message: string, title?: string): Promise<void>;
}

export interface ClipboardAdapter {
  readText(): Promise<string | null>;
  readHtml(): Promise<string | null>;
  /** Image bytes from the clipboard (e.g. pasted from Word). Null if none. */
  readImage(): Promise<Uint8Array | null>;
}

/** Content-addressed-ish blob storage for file attachments. */
export interface BlobStoreAdapter {
  put(bytes: Uint8Array, mime: string): Promise<string>; // returns blobRef
  /** Store bytes under a specific ref (used when importing an archive). */
  putAt(blobRef: string, bytes: Uint8Array, mime: string): Promise<void>;
  get(blobRef: string): Promise<Uint8Array>;
  delete(blobRef: string): Promise<void>;
  /** A URL usable as <img src> / download target for the blob. */
  url(blobRef: string): Promise<string>;
}

export interface ShellAdapter {
  openExternal(url: string): Promise<void>;
  revealItem?(path: string): Promise<void>;
}

export interface PickerAdapter {
  /** Open a native open-file dialog / document picker. */
  openFile(accept?: string[]): Promise<PickedFile | null>;
  /** Save bytes via native save dialog / share sheet / browser download. */
  saveFile(req: SaveRequest): Promise<void>;
  /** Pick an image from gallery / file system. */
  image?(): Promise<PickedFile | null>;
  /** Capture from camera (mobile). */
  camera?(): Promise<PickedFile | null>;
}

export interface PlatformAdapter {
  readonly platform: 'web' | 'tauri' | 'capacitor';
  fs: FsAdapter;
  dialogs: DialogAdapter;
  clipboard: ClipboardAdapter;
  blobStore: BlobStoreAdapter;
  shell: ShellAdapter;
  picker: PickerAdapter;
}
