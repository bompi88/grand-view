import type { DocumentId, FileId, NodeId } from './ids.js';

/** Current on-disk / on-wire schema version. Bump when the Yjs shape changes. */
export const SCHEMA_VERSION = 1;

export type NodeType = 'chapter' | 'media';

/** A {value,label} pair — mirrors the legacy tag/reference shape. */
export interface Label {
  /** Stable key; uniqueness is enforced at the op layer. */
  value: string;
  /** Display text; editable without touching nodes that reference it. */
  label: string;
}

/** An attached file's metadata. Bytes live in the platform blob store, keyed by blobRef. */
export interface FileMeta {
  id: FileId;
  name: string;
  mime: string;
  size: number;
  isImage: boolean;
  /** Opaque handle into PlatformAdapter.blobStore. */
  blobRef: string;
}

/**
 * Plain (non-CRDT) view of a node, produced by the read/selector layer.
 * The authoritative state lives in the Yjs document (see @gv/core).
 */
export interface NodeView {
  id: NodeId;
  parentId: NodeId;
  nodeType: NodeType;
  /** Fractional-index ordering key (lexicographically sorted among siblings). */
  position: string;
  isCollapsed: boolean;
  name: string;
  tags: Label[];
  references: Label[];
  files: FileMeta[];
  /** Depth from root; derived, parentId is authoritative. */
  level: number;
}

/** Library-level metadata for a Grand View document or template. */
export interface DocumentMeta {
  id: DocumentId;
  title: string;
  isTemplate: boolean;
  createdAt: number;
  lastChanged: number;
  /** Soft-delete: present (with timestamp) when in the library trash. */
  removedAt?: number;
}

export type SyncProviderKind = 'local' | 'file-sync' | 'p2p' | 'relay' | 'cloud';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/** A collaborator's ephemeral presence (Yjs awareness). */
export interface PresenceUser {
  name: string;
  color: string;
  deviceId: string;
}
