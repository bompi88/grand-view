import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { BaseSyncProvider } from './interface.js';

/**
 * Local-only persistence for web & mobile (Capacitor) targets. Always usable
 * offline; forms the base layer that live providers stack on top of.
 */
export class LocalIndexeddbProvider extends BaseSyncProvider {
  readonly kind = 'local' as const;
  private persistence: IndexeddbPersistence | null = null;

  async connect(doc: Y.Doc, room: string): Promise<void> {
    this.setStatus('connecting');
    this.persistence = new IndexeddbPersistence(room, doc);
    await this.persistence.whenSynced;
    this.setStatus('connected');
  }

  async disconnect(): Promise<void> {
    await this.persistence?.destroy();
    this.persistence = null;
    this.setStatus('disconnected');
  }
}
